// services, features, and other libraries
import { DateTime, Option } from "effect";
import { assign, assertEvent, setup } from "xstate";

// types
import type { RunSession, WordScore } from "@/features/game/domain";

// constants
import { INITIAL_RUN_SESSION } from "@/features/game/domain";

export const runSessionMachine = setup({
  types: {} as {
    events:
      | { readonly type: "runSession.reset" }
      | { readonly type: "runSession.started"; readonly now: DateTime.Utc }
      | { readonly type: "runSession.wordBanked"; readonly wordScore: WordScore }
      | { readonly type: "runSession.finished" };
    context: RunSession;
    input: RunSession;
    tags: "activeRun";
  },
  guards: {
    hasActiveRun: ({ context }) => Option.isSome(context.runId),
  },
  actions: {
    // Reset only the active run progress while preserving historical session stats
    resetRun: assign(
      ({ context }) => ({ ...INITIAL_RUN_SESSION, bestRunScore: context.bestRunScore, bestStreak: context.bestStreak }) as const satisfies RunSession
    ),

    // Start a new arcade run while preserving historical session stats
    startRun: assign(({ context, event }) => {
      assertEvent(event, "runSession.started");
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
      assertEvent(event, "runSession.wordBanked");
      return {
        ...context,
        runScore: context.runScore + event.wordScore.wordScore,
        streak: context.streak + 1,
        bestRunScore: Math.max(context.bestRunScore, context.runScore + event.wordScore.wordScore),
        bestStreak: Math.max(context.bestStreak, context.streak + 1),
      } as const satisfies RunSession;
    }),

    // Close out the active run and record it as the latest completed run while preserving historical session stats
    finishRun: assign(
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
    classifying: {
      always: [{ guard: "hasActiveRun", target: "active" }, { target: "inactive" }],
    },
    inactive: {
      on: {
        "runSession.reset": {
          target: "classifying",
          actions: "resetRun",
        },
        "runSession.started": {
          target: "classifying",
          actions: "startRun",
        },
      },
    },
    active: {
      tags: ["activeRun"],
      on: {
        "runSession.reset": {
          target: "classifying",
          actions: "resetRun",
        },
        "runSession.started": {
          target: "classifying",
          actions: "startRun",
        },
        "runSession.wordBanked": {
          target: "classifying",
          actions: "bankWord",
        },
        "runSession.finished": {
          target: "classifying",
          actions: "finishRun",
        },
      },
    },
  },
});
