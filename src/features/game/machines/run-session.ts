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
    events: { readonly type: "started" } | { readonly type: "wordBanked"; readonly wordScore: WordScore } | { readonly type: "finished" };
    context: RunSession;
    input: RunSession;
    tags: "activeRun";
  },
  guards: {
    hasActiveRun: ({ context }) => Option.isSome(context.runId),
  },
  actions: {
    // Start a new arcade run, wiping previous run stats but preserving historical "best" stats
    start: assign(
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
      assertEvent(event, "wordBanked");

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

    // Close out the active run by clearing identifiers, but LEAVE runScore and streak intact for the UI!
    finish: assign(({ context }) => ({ ...context, runId: Option.none(), createdAt: Option.none() }) as const satisfies RunSession),
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
        // Bank volatile points into the persistent run session
        wordBanked: {
          actions: "bankWord",
        },

        // Finalize the run
        finished: {
          target: "inactive",
          actions: "finish",
        },
      },
    },
  },
});
