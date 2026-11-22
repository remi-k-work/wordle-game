// services, features, and other libraries
import { Option } from "effect";
import { setup } from "./setup";
import { runFinishedContext } from "./helpers";

// constants
import { INITIAL_HIGH_SCORE } from "./constants";

export const highScoreMachine = setup.createMachine({
  id: "highScore",
  context: INITIAL_HIGH_SCORE,
  initial: "awaitingFinishedRun",

  on: {
    // A newly finished run always takes over, whatever the machine was doing
    runFinished: { target: ".checkingQualification", context: ({ event }) => runFinishedContext(event) },
  },

  states: {
    awaitingFinishedRun: {},

    checkingQualification: {
      invoke: {
        src: "top10HighScoresActor",
        input: ({ context }) => ({ solutionsLanguage: context.solutionsLanguage }),
        onDone: (args) =>
          args.guards.qualifiesForHighScore(args, { top10HighScores: args.event.output }) ? { target: "form" } : { target: "awaitingFinishedRun" },

        // Silently fail or handle gracefully
        onError: { target: "awaitingFinishedRun" },
      },
    },

    // The two states that show the initials form; they share the submit transition
    form: {
      initial: "enteringInitials",

      on: {
        initialsSubmitted: { target: "submitting", context: ({ context, event }) => ({ ...context, playerName: event.playerName }) },
      },

      states: {
        enteringInitials: {},
        failure: {
          id: "formFailure",
          entry: (_args, enq) => {
            enq(_args.actions.onFailure, { self: _args.self });
          },
        },
      },
    },

    submitting: {
      invoke: {
        src: "addNewHighScoreActor",
        input: ({ context }) => ({ context }),
        onDone: (args, enq) => {
          // A `Some` means the submission took the last slot; `None` means the
          // board filled up meanwhile, so the run no longer qualifies
          if (Option.isSome(args.event.output)) {
            return { target: "success", context: { ...args.context, newHighScoreId: args.event.output } };
          }
          enq(args.actions.onNoLongerQualified, { self: args.self });
          return { target: "awaitingFinishedRun" };
        },
        onError: { target: "#formFailure" },
      },
    },

    success: {
      entry: (_args, enq) => {
        enq(_args.actions.onSuccess, { self: _args.self });
      },

      after: {
        // The delayed modal show is likewise a transition function
        successModalDelay: (_args, enq) => {
          enq(_args.actions.showHighScoreModal, { self: _args.self });
          return { target: "awaitingFinishedRun" };
        },
      },
    },
  },
});
