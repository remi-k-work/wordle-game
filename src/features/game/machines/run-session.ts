// oxlint-disable effecttsgo/crypto-random-uuid effecttsgo/global-date typescript/no-misused-spread

// services, features, and other libraries
import { DateTime, Effect, Option } from "effect";
import { Atom } from "effect/unstable/reactivity";
import { runClientCommand } from "@/lib/runtime-client";
import { setup, assign, assertEvent } from "xstate";
import { gameSettingsSolutionsLanguageAtom } from "@/features/settings/state";
import { highScoreMachineAtom } from "@/features/high-score/state";
import { trackForfeitedRun, trackStartedNewRun } from "@/features/telemetry/state";
import { runResultAtom } from "@/features/game/state";

// types
import type { RunDeathReason, RunSession, WordChallenge, WordScore } from "@/features/game/domain";

// constants
import { INITIAL_RUN_SESSION } from "@/features/game/domain";

export const runSessionMachine = setup({
  types: {} as {
    events:
      | { readonly type: "solutionsLanguageChanged" }
      | { readonly type: "startedNewRun" }
      | { readonly type: "forfeitedRun"; readonly wordChallenge: WordChallenge }
      | { readonly type: "wordWon"; readonly wordScore: WordScore }
      | { readonly type: "runScoreSpent"; readonly amount: WordScore["wordScore"] }
      | { readonly type: "wordLost" };
    context: RunSession;
    input: RunSession;
  },
  guards: { hasActiveRun: ({ context }) => Option.isSome(context.runId) },
  actions: {
    // Start a new arcade run, wiping previous run stats but preserving historical "best" stats
    // NOTE: `assign` is synchronous, so `Clock`/`DateTime.now` (Effects) and the
    // `Crypto` service are unavailable here — `crypto.randomUUID()`/`Date.now()`
    // are the correct tools. Effect's `Random` has no UUID API regardless.
    startNewRun: assign(
      ({ context }) =>
        ({
          ...INITIAL_RUN_SESSION,
          runId: Option.some(crypto.randomUUID()),
          createdAt: Option.some(DateTime.makeUnsafe(Date.now())),
          bestRunScore: context.bestRunScore,
          bestStreak: context.bestStreak,
        }) as const satisfies RunSession
    ),

    // Bank volatile points into the persistent run session
    bankWord: assign(({ context, event }) => {
      assertEvent(event, "wordWon");

      const runScore = context.runScore + event.wordScore.wordScore;
      const streak = context.streak + 1;

      return {
        ...context,
        runScore,
        streak,
        bestRunScore: Math.max(context.bestRunScore, runScore),
        bestStreak: Math.max(context.bestStreak, streak),
      } as const satisfies RunSession;
    }),

    // Score spending is a generic run concern
    spendRunScore: assign(({ context, event }) => {
      assertEvent(event, "runScoreSpent");
      return { ...context, runScore: Math.max(0, context.runScore - event.amount) } as const satisfies RunSession;
    }),

    // Finish the active run by clearing identifiers, but LEAVE runScore, streak, and createdAt intact for the UI!
    finishActiveRun: assign(
      ({ context }) => ({ ...INITIAL_RUN_SESSION, bestRunScore: context.bestRunScore, bestStreak: context.bestStreak }) as const satisfies RunSession
    ),

    clearFinishedRun: () => runClientCommand(Atom.set(runResultAtom, Option.none())),

    saveFinishedRun: ({ context }, params: { deathReason: RunDeathReason }) =>
      runClientCommand(
        Effect.gen(function* () {
          const now = yield* DateTime.now;
          const runId = Option.getOrThrow(context.runId);
          const createdAt = Option.getOrElse(context.createdAt, () => now);
          yield* Atom.set(
            runResultAtom,
            Option.some({ runId, createdAt, finishedAt: now, runScore: context.runScore, streak: context.streak, deathReason: params.deathReason })
          );
        })
      ),

    // Track metrics related to the action of starting a new run (stream 2 -> global_pulse)
    trackStartedNewRun: () => runClientCommand(trackStartedNewRun),

    // Track metrics related to the action of forfeiting a run (stream 2 -> global_pulse)
    trackForfeitedRun: ({ context, event }) => {
      assertEvent(event, "forfeitedRun");

      // Only track if there is an active run to forfeit
      if (Option.isNone(context.runId)) return;

      void runClientCommand(trackForfeitedRun(context, event.wordChallenge));
    },

    // Notify high score machine that a run has finished
    onRunFinished: ({ context }) => {
      void runClientCommand(
        Effect.gen(function* () {
          const solutionsLanguage = yield* Atom.get(gameSettingsSolutionsLanguageAtom);
          yield* Atom.set(highScoreMachineAtom, { type: "runFinished", runScore: context.runScore, streak: context.streak, solutionsLanguage });
        })
      );
    },
  },
}).createMachine({
  id: "runSession",
  // Hydrate the machine with the input from the KVS Atom
  context: ({ input }) => ({ ...input }) as const satisfies RunSession,
  initial: "classifying",

  states: {
    // Determine whether we are restoring an active or completed run
    classifying: {
      always: [{ guard: "hasActiveRun", target: "active" }, { target: "inactive" }],
    },

    inactive: {
      on: {
        // Start a brand-new arcade run
        startedNewRun: { target: "active", actions: ["trackStartedNewRun", "startNewRun", "clearFinishedRun"] },
      },
    },

    active: {
      on: {
        solutionsLanguageChanged: { target: "inactive", actions: ["finishActiveRun", "clearFinishedRun"] },

        // Forfeit the active run
        forfeitedRun: {
          target: "inactive",
          actions: ["trackForfeitedRun", { type: "saveFinishedRun", params: { deathReason: "Forfeit" } }, "onRunFinished", "finishActiveRun"],
        },

        // Word won, bank volatile points
        wordWon: { actions: "bankWord" },

        runScoreSpent: { actions: "spendRunScore" },

        // Word lost, finish the active run
        wordLost: {
          target: "inactive",
          actions: [{ type: "saveFinishedRun", params: { deathReason: "Guesses" } }, "onRunFinished", "finishActiveRun"],
        },
      },
    },
  },
});
