// services, features, and other libraries
import { DateTime, Option } from "effect";
import { assign, assertEvent, setup } from "xstate";

// types
import type { RunSession, WordScore } from "@/features/game/domain";
export type RunSessionMachineContext = RunSession;

// constants
import { INITIAL_RUN_SESSION } from "@/features/game/domain";

export const runSessionMachine = setup({
  types: {} as {
    events:
      | { readonly type: "reset" }
      | { readonly type: "started"; readonly now: DateTime.Utc }
      | { readonly type: "wordBanked"; readonly wordScore: WordScore }
      | { readonly type: "finished" };
    context: RunSession;
    input: RunSession;
    tags: "activeRun";
  },
  guards: {
    hasActiveRun: ({ context }) => Option.isSome(context.runId),
  },
  actions: {
    // Reset only the active run progress while preserving historical session stats
    reset: assign(
      ({ context }) => ({ ...INITIAL_RUN_SESSION, bestRunScore: context.bestRunScore, bestStreak: context.bestStreak }) as const satisfies RunSession
    ),

    // Start a new arcade run while preserving historical session stats
    start: assign(({ context, event }) => {
      assertEvent(event, "started");

      return {
        ...INITIAL_RUN_SESSION,
        runId: Option.some(crypto.randomUUID()),
        createdAt: Option.some(event.now),
        bestRunScore: context.bestRunScore,
        bestStreak: context.bestStreak,
      } as const satisfies RunSession;
    }),

    // Add a solved word score into the ongoing arcade run
    bankWord: assign(({ context, event }) => {
      assertEvent(event, "wordBanked");

      return {
        ...context,
        runScore: context.runScore + event.wordScore.wordScore,
        streak: context.streak + 1,
        bestRunScore: Math.max(context.bestRunScore, context.runScore + event.wordScore.wordScore),
        bestStreak: Math.max(context.bestStreak, context.streak + 1),
      } as const satisfies RunSession;
    }),

    // Close out the active run and record it as the latest completed run while preserving historical session stats
    finish: assign(
      ({ context }) =>
        ({
          ...INITIAL_RUN_SESSION,
          lastRunScore: context.runScore,
          lastStreak: context.streak,
          bestRunScore: context.bestRunScore,
          bestStreak: context.bestStreak,
        }) as const satisfies RunSession
    ),
  },
}).createMachine({
  id: "runSession",
  // Hydrate the machine with the input from the KVS Atom
  context: ({ input }) => ({ ...input }),
  initial: "classifying",

  states: {
    // Determine whether we are restoring an active or completed run
    classifying: {
      always: [{ guard: "hasActiveRun", target: "active" }, { target: "inactive" }],
    },

    inactive: {
      on: {
        // Start a brand-new arcade run
        started: {
          target: "active",
          actions: "start",
        },
      },
    },

    active: {
      // Convenient tag for selectors and UI state checks
      tags: ["activeRun"],

      on: {
        // Abandon the current run while preserving historical stats
        reset: {
          target: "inactive",
          actions: "reset",
        },

        // Add a completed word score into the active run
        wordBanked: {
          actions: "bankWord",
        },

        // Finalize the run and snapshot its results
        finished: {
          target: "inactive",
          actions: "finish",
        },
      },
    },
  },
});
