// services, features, and other libraries
import { Effect, Option } from "effect";
import { Atom } from "effect/reactivity";
import { runClientCommand } from "@/lib/runtime-client";
import { effectActor } from "@/lib/effect-actor";
import { RpcHighScoreClient } from "@/features/high-score/rpc/client";
import { assign, setup, assertEvent } from "xstate";
import { msg } from "gt-react";
import { toastManager } from "@/ui/toastify";
import { modalMachineAtom } from "@/state/modal";
import { qualifiesForTop10 } from "@/features/high-score/domain/helpers";
import { AddHighScore } from "@/features/high-score/domain/models";

// types
import type { HighScore, HighScoreMachineContext } from "@/features/high-score/domain/models";

interface Top10HighScoresInput {
  solutionsLanguage: HighScoreMachineContext["solutionsLanguage"];
}

interface AddHighScoreInput {
  context: HighScoreMachineContext;
}

// constants
import { INITIAL_HIGH_SCORE_CONTEXT } from "@/features/high-score/domain/constants";

const top10HighScoresActor = effectActor(({ solutionsLanguage }: Top10HighScoresInput) =>
  Effect.flatMap(RpcHighScoreClient, ({ top10HighScores }) => top10HighScores(solutionsLanguage))
);

const addHighScoreActor = effectActor(({ context }: AddHighScoreInput) =>
  Effect.flatMap(RpcHighScoreClient, ({ addHighScore }) =>
    // Explicit field selection: the machine context carries non-wire fields
    // (e.g. newHighScoreId) that must not ride into the request
    addHighScore(
      AddHighScore.make({
        playerName: context.playerName,
        score: context.runScore,
        streak: context.streak,
        solutionsLang: context.solutionsLanguage,
      })
    )
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
    qualifiesForHighScore: ({ context }, params: { top10HighScores: ReadonlyArray<HighScore> }) =>
      // Fewer than 10 entries means any score qualifies; otherwise it must beat
      // the 10th-place entry (shared with the DB service's post-lock re-check)
      qualifiesForTop10(params.top10HighScores, context.runScore, context.streak),
  },
  actions: {
    saveRunData: assign(({ event }) => {
      assertEvent(event, "runFinished");
      // Explicit field selection rather than spreading `event`: a spread-derived
      // property is not checked by `satisfies`, so the event's `type` would land
      // in the context (which has no such field) unchecked
      return {
        ...INITIAL_HIGH_SCORE_CONTEXT,
        runScore: event.runScore,
        streak: event.streak,
        solutionsLanguage: event.solutionsLanguage,
      } as const satisfies HighScoreMachineContext;
    }),

    saveInitials: assign(({ context, event }) => {
      assertEvent(event, "initialsSubmitted");
      return { ...context, playerName: event.playerName } as const satisfies HighScoreMachineContext;
    }),

    saveNewHighScoreId: assign(
      ({ context }, params: { newHighScoreId: HighScoreMachineContext["newHighScoreId"] }) =>
        ({ ...context, newHighScoreId: params.newHighScoreId }) as const satisfies HighScoreMachineContext
    ),

    onSuccess: () =>
      toastManager.add({
        title: msg("Score Recorded"),
        description: msg("Good luck on your next run!"),
      }),

    onNoLongerQualified: () =>
      toastManager.add({
        type: "error",
        title: msg("Leaderboard Updated"),
        description: msg("This score no longer qualifies for the Top 10."),
      }),

    onFailure: () =>
      toastManager.add({
        type: "error",
        title: msg("Submission Failed"),
        description: msg("Failed to save your score. Please try again later."),
      }),

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
