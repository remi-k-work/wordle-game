// services, features, and other libraries
import { Effect, Option } from "effect";
import { Atom } from "effect/unstable/reactivity";
import { RuntimeClient, runClientCommand } from "@/lib/runtime-client";
import { RpcHighScoreClient } from "@/features/high-score/rpc/client";
import { assign, setup, fromPromise, assertEvent } from "xstate";
import { toastManager } from "@/ui/toastify";
import { modalMachineAtom } from "@/state";

// types
import type { AddHighScore, HighScore, HighScoreMachineContext } from "@/features/high-score/domain";

// constants
import { INITIAL_HIGH_SCORE_CONTEXT } from "@/features/high-score/domain";

const top10HighScoresActor = fromPromise(
  async ({ input, signal }: { input: { solutionsLanguage: HighScoreMachineContext["solutionsLanguage"] }; signal: AbortSignal }) =>
    RuntimeClient.runPromise(
      Effect.gen(function* () {
        const { top10HighScores } = yield* RpcHighScoreClient;
        return yield* top10HighScores(input.solutionsLanguage);
      }),
      { signal }
    )
);

const addHighScoreActor = fromPromise(async ({ input: { context }, signal }: { input: { context: HighScoreMachineContext }; signal: AbortSignal }) =>
  RuntimeClient.runPromise(
    Effect.gen(function* () {
      const { addHighScore } = yield* RpcHighScoreClient;
      return yield* addHighScore({ ...context, score: context.runScore, solutionsLang: context.solutionsLanguage } as const satisfies AddHighScore);
    }),
    { signal }
  )
);

export const highScoreMachine = setup({
  types: {} as {
    events:
      | {
          readonly type: "runFinished";
          runScore: HighScoreMachineContext["runScore"];
          streak: HighScoreMachineContext["streak"];
          solutionsLanguage: HighScoreMachineContext["solutionsLanguage"];
        }
      | { readonly type: "initialsSubmitted"; playerName: HighScoreMachineContext["playerName"] };
    context: HighScoreMachineContext;
  },
  guards: {
    // Determine if the current run qualifies for the high score
    qualifiesForHighScore: ({ context }, params: { top10HighScores: ReadonlyArray<HighScore> }) => {
      // If there are fewer than 10 entries, any score qualifies
      if (params.top10HighScores.length < 10) return true;

      // Get the 10th entry (the lowest score in the top 10)
      const tail = params.top10HighScores.at(-1)!;

      // Qualification rule (score must be higher than the 10th place score, or if tied, streak must be higher than the 10th place streak)
      return context.runScore > tail.score || (context.runScore === tail.score && context.streak > tail.streak);
    },
  },
  actions: {
    saveRunData: assign(({ event }) => {
      assertEvent(event, "runFinished");
      return { ...INITIAL_HIGH_SCORE_CONTEXT, ...event } as const satisfies HighScoreMachineContext;
    }),

    saveInitials: assign(({ context, event }) => {
      assertEvent(event, "initialsSubmitted");
      return { ...context, playerName: event.playerName } as const satisfies HighScoreMachineContext;
    }),

    saveNewHighScoreId: assign(
      ({ context }, params: { newHighScoreId: HighScoreMachineContext["newHighScoreId"] }) =>
        ({ ...context, newHighScoreId: params.newHighScoreId }) as const satisfies HighScoreMachineContext
    ),

    onSuccess: () => toastManager.add({ title: "Score Recorded", description: "Good luck on your next run!" }),
    onNoLongerQualified: () => toastManager.add({ type: "error", title: "Leaderboard Updated", description: "This score no longer qualifies for the Top 10." }),
    onFailure: () => toastManager.add({ type: "error", title: "Submission Failed", description: "Failed to save your score. Please try again later." }),

    showHighScoreModal: () => runClientCommand(Atom.set(modalMachineAtom, { type: "opened", modalType: "high-score" })),
  },
  actors: { top10HighScoresActor, addHighScoreActor },
  delays: { delay: 3000 },
}).createMachine({
  id: "highScore",
  context: INITIAL_HIGH_SCORE_CONTEXT,
  initial: "awaitingFinishedRun",

  states: {
    awaitingFinishedRun: {
      on: {
        runFinished: { target: "checkingQualification", actions: "saveRunData" },
      },
    },

    checkingQualification: {
      invoke: {
        src: "top10HighScoresActor",
        input: ({ context }) => ({ solutionsLanguage: context.solutionsLanguage }),
        onDone: [
          { guard: { type: "qualifiesForHighScore", params: ({ event }) => ({ top10HighScores: event.output }) }, target: "enteringInitials" },

          // Did not qualify, go back to sleep
          { target: "awaitingFinishedRun" },
        ],

        // Silently fail or handle gracefully
        onError: { target: "awaitingFinishedRun" },
      },
    },

    enteringInitials: {
      on: {
        initialsSubmitted: { target: "submitting", actions: "saveInitials" },
        runFinished: { target: "checkingQualification", actions: "saveRunData" },
      },
    },

    submitting: {
      invoke: {
        src: "addHighScoreActor",
        input: ({ context }) => ({ context }),
        onDone: [
          {
            guard: ({ event }) => Option.isSome(event.output),
            target: "success",
            actions: { type: "saveNewHighScoreId", params: ({ event }) => ({ newHighScoreId: event.output }) },
          },
          { target: "awaitingFinishedRun", actions: "onNoLongerQualified" },
        ],
        onError: { target: "failure" },
      },
    },

    success: {
      entry: "onSuccess",

      on: {
        runFinished: { target: "checkingQualification", actions: "saveRunData" },
      },

      after: {
        delay: { target: "awaitingFinishedRun", actions: "showHighScoreModal" },
      },
    },

    failure: {
      entry: "onFailure",

      on: {
        initialsSubmitted: { target: "submitting", actions: "saveInitials" },
        runFinished: { target: "checkingQualification", actions: "saveRunData" },
      },
    },
  },
});
