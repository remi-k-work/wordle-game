// services, features, and other libraries
import { assertEvent } from "xstate";
import { setup } from "./setup";

export const gameFlowMachine = setup.createMachine({
  id: "gameFlow",

  // Hydrate the flow from the persisted run session (a fresh object, never the input object itself)
  context: ({ input }) => ({ ...input }),
  initial: "classifying",

  states: {
    classifying: {
      always: (args) => {
        if (args.context.hasActiveRun) return { target: "betweenWords" };
        return { target: "ready" };
      },
    },

    // No active run: invite the player to start one
    ready: {
      on: {
        "run.startRequested": (args, enq) => {
          enq(args.actions.startRun, { self: args.self });
          return { target: "starting" };
        },

        // A language change keeps the current screen but resets every feature
        "language.changed": (args, enq) => {
          assertEvent(args.event, "language.changed");
          enq(args.actions.changeLanguage, { self: args.self, solutionsLanguage: args.event.solutionsLanguage });
        },
      },
    },

    // Transient: a new run was requested, move straight into play
    starting: {
      always: { target: "playing" },

      on: {
        "language.changed": (args, enq) => {
          assertEvent(args.event, "language.changed");
          enq(args.actions.changeLanguage, { self: args.self, solutionsLanguage: args.event.solutionsLanguage });
          return { target: "ready" };
        },
      },
    },

    // A run is being played
    playing: {
      on: {
        "word.won": (args, enq) => {
          assertEvent(args.event, "word.won");
          enq(args.actions.bankWonWord, { self: args.self, wordScore: args.event.wordScore });
          return { target: "betweenWords" };
        },

        "word.lost": (args, enq) => {
          enq(args.actions.finishLostRun, { self: args.self });
          return { target: "ready" };
        },

        "run.forfeitConfirmed": (args, enq) => {
          assertEvent(args.event, "run.forfeitConfirmed");
          enq(args.actions.forfeitRun, { self: args.self, wordChallenge: args.event.wordChallenge });
          return { target: "ready" };
        },

        "language.changed": (args, enq) => {
          assertEvent(args.event, "language.changed");
          enq(args.actions.changeLanguage, { self: args.self, solutionsLanguage: args.event.solutionsLanguage });
          return { target: "ready" };
        },
      },
    },

    // The run continues: wait for the player to ask for the next word
    betweenWords: {
      on: {
        "word.nextRequested": (args, enq) => {
          enq(args.actions.requestNextWord, { self: args.self });
          return { target: "starting" };
        },

        "language.changed": (args, enq) => {
          assertEvent(args.event, "language.changed");
          enq(args.actions.changeLanguage, { self: args.self, solutionsLanguage: args.event.solutionsLanguage });
          return { target: "ready" };
        },
      },
    },
  },
});
