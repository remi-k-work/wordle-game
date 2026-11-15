// services, features, and other libraries
import { Effect, Option, Schema } from "effect";
import { Atom, AtomRegistry } from "effect/reactivity";
import { createEffectLogic, setupEffect } from "@xstate/effect";
import { RpcHighScoreClient } from "@/features/high-score/rpc/client";
import { msg } from "gt-react";
import { toastManager } from "@/ui/toastify";
import { modalMachineSendAtom } from "@/state/modal";
import { qualifiesForTop10 } from "@/features/high-score/domain/helpers";
import { AddHighScore, HighScoreMachineContext } from "@/features/high-score/domain/models";

// types
import type { EffectSourceArgs } from "@xstate/effect";
import type { HighScore } from "@/features/high-score/domain/models";

interface Top10HighScoresInput {
  solutionsLanguage: HighScoreMachineContext["solutionsLanguage"];
}

interface AddHighScoreInput {
  context: HighScoreMachineContext;
}

// The `runFinished` payload, shared by the four transitions that reset the context with a fresh run
type RunFinished = {
  readonly runScore: HighScoreMachineContext["runScore"];
  readonly streak: HighScoreMachineContext["streak"];
  readonly solutionsLanguage: HighScoreMachineContext["solutionsLanguage"];
};

// constants
import { INITIAL_HIGH_SCORE_CONTEXT } from "@/features/high-score/domain/constants";

const runFinishedContext = (event: RunFinished) =>
  ({
    ...INITIAL_HIGH_SCORE_CONTEXT,
    runScore: event.runScore,
    streak: event.streak,
    solutionsLanguage: event.solutionsLanguage,
  }) as const satisfies HighScoreMachineContext;

const top10HighScoresActor = createEffectLogic(({ input: { solutionsLanguage } }: EffectSourceArgs<Top10HighScoresInput>) =>
  Effect.flatMap(RpcHighScoreClient, ({ top10HighScores }) => top10HighScores(solutionsLanguage))
);

const addHighScoreActor = createEffectLogic(({ input: { context } }: EffectSourceArgs<AddHighScoreInput>) =>
  Effect.flatMap(RpcHighScoreClient, ({ addHighScore }) =>
    // Explicit field selection: the machine context carries non-wire fields (e.g. newHighScoreId) that must not ride into the request
    addHighScore(
      AddHighScore.make({ playerName: context.playerName, score: context.runScore, streak: context.streak, solutionsLang: context.solutionsLanguage })
    )
  )
);

export const highScoreMachine = setupEffect({
  schemas: {
    context: HighScoreMachineContext,
    events: {
      runFinished: Schema.Struct({
        runScore: HighScoreMachineContext.fields.runScore,
        streak: HighScoreMachineContext.fields.streak,
        solutionsLanguage: HighScoreMachineContext.fields.solutionsLanguage,
      }),
      initialsSubmitted: Schema.Struct({ playerName: HighScoreMachineContext.fields.playerName }),
    },
    actions: {
      onSuccess: { params: Schema.Struct({}) },
      onNoLongerQualified: { params: Schema.Struct({}) },
      onFailure: { params: Schema.Struct({}) },
      showHighScoreModal: { params: Schema.Struct({}) },
    },
  },
  guards: {
    // Determine if the current run qualifies for the high score
    qualifiesForHighScore: ({ context }, params: { top10HighScores: ReadonlyArray<HighScore> }) =>
      // Fewer than 10 entries means any score qualifies; otherwise it must beat
      // the 10th-place entry (shared with the DB service's post-lock re-check)
      qualifiesForTop10(params.top10HighScores, context.runScore, context.streak),
  },
  actors: { top10HighScoresActor, addHighScoreActor },
  delays: { delay: 3000 },
  actions: {
    onSuccess: () =>
      Effect.sync(() => {
        toastManager.add({ title: msg("Score Recorded"), description: msg("Good luck on your next run!") });
      }),

    onNoLongerQualified: () =>
      Effect.sync(() => {
        toastManager.add({ type: "error", title: msg("Leaderboard Updated"), description: msg("This score no longer qualifies for the Top 10.") });
      }),

    onFailure: () =>
      Effect.sync(() => {
        toastManager.add({ type: "error", title: msg("Submission Failed"), description: msg("Failed to save your score. Please try again later.") });
      }),

    showHighScoreModal: (): Effect.Effect<void, never, AtomRegistry.AtomRegistry> =>
      Atom.set(modalMachineSendAtom, { type: "opened", modalType: "high-score" }),
  },
}).createMachine({
  id: "highScore",
  context: INITIAL_HIGH_SCORE_CONTEXT,
  initial: "awaitingFinishedRun",

  states: {
    awaitingFinishedRun: {
      on: {
        runFinished: { target: "checkingQualification", context: ({ event }) => runFinishedContext(event) },
      },
    },

    checkingQualification: {
      invoke: {
        src: "top10HighScoresActor",
        input: ({ context }) => ({ solutionsLanguage: context.solutionsLanguage }),
        onDone: (args) =>
          args.guards.qualifiesForHighScore(args, { top10HighScores: args.event.output }) ? { target: "enteringInitials" } : { target: "awaitingFinishedRun" },

        // Silently fail or handle gracefully
        onError: { target: "awaitingFinishedRun" },
      },
    },

    enteringInitials: {
      on: {
        initialsSubmitted: { target: "submitting", context: ({ context, event }) => ({ ...context, playerName: event.playerName }) },
        runFinished: { target: "checkingQualification", context: ({ event }) => runFinishedContext(event) },
      },
    },

    submitting: {
      invoke: {
        src: "addHighScoreActor",
        input: ({ context }) => ({ context }),
        onDone: (args, enq) => {
          const { event } = args;
          if (Option.isSome(event.output)) return { target: "success", context: { ...args.context, newHighScoreId: event.output } };
          enq(args.actions.onNoLongerQualified, { self: args.self });
          return { target: "awaitingFinishedRun" };
        },
        onError: { target: "failure" },
      },
    },

    success: {
      entry: (_args, enq) => {
        enq(_args.actions.onSuccess, { self: _args.self });
      },

      on: {
        runFinished: { target: "checkingQualification", context: ({ event }) => runFinishedContext(event) },
      },

      after: {
        // The delayed modal show is likewise a transition function
        delay: (_args, enq) => {
          enq(_args.actions.showHighScoreModal, { self: _args.self });
          return { target: "awaitingFinishedRun" };
        },
      },
    },

    failure: {
      entry: (_args, enq) => {
        enq(_args.actions.onFailure, { self: _args.self });
      },

      on: {
        initialsSubmitted: { target: "submitting", context: ({ context, event }) => ({ ...context, playerName: event.playerName }) },
        runFinished: { target: "checkingQualification", context: ({ event }) => runFinishedContext(event) },
      },
    },
  },
});
