// services, features, and other libraries
import { DateTime, Effect, Option, Schema } from "effect";
import { Atom, AtomRegistry } from "effect/reactivity";
import { setupEffect } from "@xstate/effect";
import { RunDeathReason, WordScore } from "@/features/game/domain/models";
import { WordChallenge } from "@/features/game/machines/word-challenge/models";
import { trackForfeitedRun, trackStartedNewRun } from "@/features/telemetry/state/actions";
import { runResultAtom } from "@/features/game/state/run-session";
import { gameSettingsSolutionsLanguageAtom } from "@/features/settings/state/game-settings";
import { highScoreMachineSendAtom } from "@/features/high-score/state/high-score";
import { RunSession } from "./models";

export const setup = setupEffect({
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
    saveFinishedRun: Effect.fnUntraced(function* (
      // Explicit param type: unlike a plain arrow, the generator passed to
      // Effect.fnUntraced gets no contextual typing from the actions record
      { runSession, deathReason }: { readonly runSession: RunSession; readonly deathReason: RunDeathReason }
    ) {
      const now = yield* DateTime.now;
      const runId = yield* Effect.fromOption(runSession.runId);
      const createdAt = Option.getOrElse(runSession.createdAt, () => now);
      yield* Atom.set(runResultAtom, Option.some({ runId, createdAt, finishedAt: now, runScore: runSession.runScore, streak: runSession.streak, deathReason }));
    }),

    // Track metrics related to the action of forfeiting a run (stream 2 -> global_pulse)
    trackForfeitedRun: ({ runSession, wordChallenge }) => trackForfeitedRun(runSession, wordChallenge),

    // Notify high score machine that a run has finished
    onRunFinished: Effect.fnUntraced(function* ({ runSession }: { readonly runSession: RunSession }) {
      const solutionsLanguage = yield* Atom.get(gameSettingsSolutionsLanguageAtom);
      yield* Atom.set(highScoreMachineSendAtom, { type: "runFinished", runScore: runSession.runScore, streak: runSession.streak, solutionsLanguage });
    }),
  },
});
