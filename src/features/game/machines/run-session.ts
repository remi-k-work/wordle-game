// services, features, and other libraries
import { Cause, DateTime, Effect, Option, Schema } from "effect";
import { Atom, AtomRegistry } from "effect/reactivity";
import { setupEffect } from "@xstate/effect";
import { assertEvent } from "xstate";
import { gameSettingsSolutionsLanguageAtom } from "@/features/settings/state/game-settings";
import { highScoreMachineSendAtom } from "@/features/high-score/state/high-score";
import { trackForfeitedRun, trackStartedNewRun } from "@/features/telemetry/state/actions";
import { runResultAtom } from "@/features/game/state/run-session";
import { RunDeathReason, RunSession, WordChallenge, WordScore } from "@/features/game/domain/models";

// constants
import { INITIAL_RUN_SESSION } from "@/features/game/domain/constants";

const finishActiveRunContext = (context: RunSession) =>
  ({ ...INITIAL_RUN_SESSION, bestRunScore: context.bestRunScore, bestStreak: context.bestStreak }) as const satisfies RunSession;

export const runSessionMachine = setupEffect({
  schemas: {
    context: RunSession,

    // The machine is hydrated from the persisted KVS atom, whose value is the createActor input
    input: RunSession,
    events: {
      solutionsLanguageChanged: Schema.Struct({}),
      startedNewRun: Schema.Struct({}),
      forfeitedRun: Schema.Struct({ wordChallenge: WordChallenge }),
      wordWon: Schema.Struct({ wordScore: WordScore }),
      runScoreSpent: Schema.Struct({ amount: WordScore.fields.wordScore }),
      wordLost: Schema.Struct({}),
    },
    actions: {
      clearFinishedRun: { params: Schema.Struct({}) },
      trackStartedNewRun: { params: Schema.Struct({}) },
      saveFinishedRun: { params: Schema.Struct({ runSession: RunSession, deathReason: RunDeathReason }) },
      trackForfeitedRun: { params: Schema.Struct({ runSession: RunSession, wordChallenge: WordChallenge }) },
      onRunFinished: { params: Schema.Struct({ runSession: RunSession }) },
    },
  },
  guards: { hasActiveRun: ({ context }) => Option.isSome(context.runId) },
  actions: {
    // The completed-run summary belongs to the result UI, not durable storage: clearing it is an atom write
    clearFinishedRun: (): Effect.Effect<void, never, AtomRegistry.AtomRegistry> => Atom.set(runResultAtom, Option.none()),

    // Track metrics related to the action of starting a new run (stream 2 -> global_pulse)
    trackStartedNewRun: () => trackStartedNewRun(),

    // Build the immutable completed-run summary; `runId` is present by invariant for any active run,
    // so the Option lift cannot fail in practice (its typed failure still rides the machine's error channel)
    saveFinishedRun: ({ runSession, deathReason }): Effect.Effect<void, Cause.NoSuchElementError, AtomRegistry.AtomRegistry> =>
      Effect.gen(function* () {
        const now = yield* DateTime.now;
        const runId = yield* Effect.fromOption(runSession.runId);
        const createdAt = Option.getOrElse(runSession.createdAt, () => now);
        yield* Atom.set(
          runResultAtom,
          Option.some({ runId, createdAt, finishedAt: now, runScore: runSession.runScore, streak: runSession.streak, deathReason })
        );
      }),

    // Track metrics related to the action of forfeiting a run (stream 2 -> global_pulse)
    trackForfeitedRun: ({ runSession, wordChallenge }) => trackForfeitedRun(runSession, wordChallenge),

    // Notify high score machine that a run has finished
    onRunFinished: ({ runSession }): Effect.Effect<void, never, AtomRegistry.AtomRegistry> =>
      Effect.gen(function* () {
        const solutionsLanguage = yield* Atom.get(gameSettingsSolutionsLanguageAtom);
        yield* Atom.set(highScoreMachineSendAtom, { type: "runFinished", runScore: runSession.runScore, streak: runSession.streak, solutionsLanguage });
      }),
  },
}).createMachine({
  id: "runSession",

  // Hydrate the machine with the input from the KVS Atom
  context: ({ input }) => ({ ...input }) satisfies RunSession,
  initial: "classifying",

  states: {
    // Determine whether we are restoring an active or completed run
    classifying: {
      always: (args) => (args.guards.hasActiveRun(args) ? { target: "active" } : { target: "inactive" }),
    },

    inactive: {
      on: {
        // Start a brand-new arcade run
        startedNewRun: (args, enq) => {
          enq(args.actions.trackStartedNewRun, { self: args.self });
          enq(args.actions.clearFinishedRun, { self: args.self });
          return {
            target: "active",
            context: {
              ...INITIAL_RUN_SESSION,
              runId: Option.some(crypto.randomUUID()),
              createdAt: Option.some(DateTime.nowUnsafe()),
              bestRunScore: args.context.bestRunScore,
              bestStreak: args.context.bestStreak,
            },
          };
        },
      },
    },

    active: {
      on: {
        // A language change abandons the active run
        solutionsLanguageChanged: (args, enq) => {
          enq(args.actions.clearFinishedRun, { self: args.self });
          return { target: "inactive", context: finishActiveRunContext(args.context) };
        },

        // Forfeit the active run
        forfeitedRun: (args, enq) => {
          assertEvent(args.event, "forfeitedRun");
          enq(args.actions.trackForfeitedRun, { self: args.self, runSession: args.context, wordChallenge: args.event.wordChallenge });
          enq(args.actions.saveFinishedRun, { self: args.self, runSession: args.context, deathReason: "Forfeit" });
          enq(args.actions.onRunFinished, { self: args.self, runSession: args.context });
          return { target: "inactive", context: finishActiveRunContext(args.context) };
        },

        // Word won, bank volatile points
        wordWon: (args) => {
          assertEvent(args.event, "wordWon");
          const runScore = args.context.runScore + args.event.wordScore.wordScore;
          const streak = args.context.streak + 1;
          return {
            context: {
              ...args.context,
              runScore,
              streak,
              bestRunScore: Math.max(args.context.bestRunScore, runScore),
              bestStreak: Math.max(args.context.bestStreak, streak),
            },
          };
        },

        runScoreSpent: (args) => {
          assertEvent(args.event, "runScoreSpent");
          return { context: { ...args.context, runScore: Math.max(0, args.context.runScore - args.event.amount) } };
        },

        // Word lost, finish the active run (same shape as forfeit, without the forfeit telemetry)
        wordLost: (args, enq) => {
          enq(args.actions.saveFinishedRun, { self: args.self, runSession: args.context, deathReason: "Guesses" });
          enq(args.actions.onRunFinished, { self: args.self, runSession: args.context });
          return { target: "inactive", context: finishActiveRunContext(args.context) };
        },
      },
    },
  },
});
