// services, features, and other libraries
import { DateTime, Effect, Option } from "effect";
import { Atom } from "effect/unstable/reactivity";
import { RuntimeClient } from "@/lib/runtime-client";
import { setup, assign, assertEvent } from "xstate";
import { wordChallengeMachineAtom } from "@/features/game/state";
import { gameSettingsSolutionsLanguageAtom } from "@/features/settings/state";
import { highScoreMachineAtom } from "@/features/high-score/state";
import { trackForfeitedRun, trackStartedNewRun } from "@/features/telemetry/state";

// types
import type { RunSession, WordScore } from "@/features/game/domain";
export type RunSessionMachineContext = RunSession;

// constants
import { INITIAL_RUN_SESSION } from "@/features/game/domain";

export const runSessionMachine = setup({
  types: {} as {
    events:
      | { readonly type: "solutionsLanguageChanged" }
      | { readonly type: "startedNewRun" }
      | { readonly type: "forfeitedRun" }
      | { readonly type: "wordWon"; readonly wordScore: WordScore }
      | { readonly type: "wordLost" };
    context: RunSession;
    input: RunSession;
  },
  guards: { hasActiveRun: ({ context }) => Option.isSome(context.runId) },
  actions: {
    // Start a new arcade run, wiping previous run stats but preserving historical "best" stats
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

    // Finish the active run by clearing identifiers, but LEAVE runScore, streak, and createdAt intact for the UI!
    finishActiveRun: assign(({ context }) => ({ ...context, runId: Option.none() }) as const satisfies RunSession),

    // Track metrics related to the action of starting a new run (stream 2 -> global_pulse)
    trackStartedNewRun: () => RuntimeClient.runPromise(trackStartedNewRun),

    // Track metrics related to the action of forfeiting a run (stream 2 -> global_pulse)
    trackForfeitedRun: ({ context }) =>
      RuntimeClient.runPromise(
        Effect.gen(function* () {
          const wordChallengeMachineContext = (yield* Atom.get(wordChallengeMachineAtom)).context;
          yield* trackForfeitedRun(context, wordChallengeMachineContext);
        })
      ),

    // Notify high score machine that a run has finished
    onRunFinished: ({ context }) => {
      RuntimeClient.runPromise(
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
        startedNewRun: { target: "active", actions: ["trackStartedNewRun", "startNewRun"] },
      },
    },

    active: {
      on: {
        // Solutions language changed, so forfeit the current run and immediately start a new one
        solutionsLanguageChanged: { target: "active", actions: ["trackForfeitedRun", "finishActiveRun", "trackStartedNewRun", "startNewRun"], reenter: true },

        // Forfeit the active run
        forfeitedRun: { target: "inactive", actions: ["trackForfeitedRun", "finishActiveRun", "onRunFinished"] },

        // Word won, bank volatile points
        wordWon: { actions: "bankWord" },

        // Word lost, finish the active run
        wordLost: { target: "inactive", actions: ["finishActiveRun", "onRunFinished"] },
      },
    },
  },
});
