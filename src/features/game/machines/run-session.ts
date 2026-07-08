// services, features, and other libraries
import { DateTime, Option } from "effect";
import { RuntimeClient } from "@/lib/runtime-client";
import { setup, assign, assertEvent, fromPromise } from "xstate";
import { trackStartedNewRun } from "@/features/telemetry/state";

// types
import type { RunSession, WordScore } from "@/features/game/domain";
export type RunSessionMachineContext = RunSession;

// constants
import { INITIAL_RUN_SESSION } from "@/features/game/domain";

// Track metrics related to the action of starting a new run (stream 2 -> global_pulse)
const onStartedNewRunActor = fromPromise(async ({ signal }: { signal: AbortSignal }) => RuntimeClient.runPromise(trackStartedNewRun, { signal }));

export const runSessionMachine = setup({
  types: {} as {
    events:
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

    // Finish the active run by clearing identifiers, but LEAVE runScore and streak intact for the UI!
    finishActiveRun: assign(({ context }) => ({ ...context, runId: Option.none(), createdAt: Option.none() }) as const satisfies RunSession),
  },
  actors: { onStartedNewRunActor },
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
        startedNewRun: { target: "startedNewRun", actions: "startNewRun" },
      },
    },

    startedNewRun: { invoke: { src: "onStartedNewRunActor", onDone: "active", onError: "active" } },

    active: {
      on: {
        // Forfeit the active run
        forfeitedRun: { target: "inactive", actions: "finishActiveRun" },

        // Word won, bank volatile points
        wordWon: { actions: "bankWord" },

        // Word lost, finish the active run
        wordLost: { target: "inactive", actions: "finishActiveRun" },
      },
    },
  },
});
