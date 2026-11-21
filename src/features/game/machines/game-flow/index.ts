// services, features, and other libraries
import { assertEvent } from "xstate";
import { setup } from "./setup";

export const gameFlowMachine = setup.createMachine({
  id: "gameFlow",

  // Hydrate the flow from the persisted run session (a fresh object, never the input object itself)
  context: ({ input }) => ({ ...input }),
  initial: "classifying",

  on: {
    // A language change resets every feature machine and returns the flow to the
    // ready screen from any state — one machine-level handler instead of a copy
    // per state (the same pattern the other feature machines use for their
    // global events, e.g. word-challenge's solutionsLanguageChanged)
    solutionsLanguageChanged: (args, enq) => {
      assertEvent(args.event, "solutionsLanguageChanged");
      enq(args.actions.changeLanguage, { self: args.self, solutionsLanguage: args.event.solutionsLanguage });
      // `.ready` (not `ready`): a target on the root node resolves against the
      // root's children, so it must be prefixed with `.` — a bare key throws E13
      return { target: ".ready" };
    },
  },

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
        newRunStarted: (args, enq) => {
          enq(args.actions.startNewRun, { self: args.self });
          return { target: "starting" };
        },
      },
    },

    // Transient: a new run was requested, move straight into play
    starting: {
      always: { target: "playing" },
    },

    // A run is being played
    playing: {
      on: {
        wordWon: (args, enq) => {
          assertEvent(args.event, "wordWon");
          enq(args.actions.bankWonWord, { self: args.self, wordScore: args.event.wordScore });
          return { target: "betweenWords" };
        },

        wordLost: (args, enq) => {
          enq(args.actions.finishLostRun, { self: args.self });
          return { target: "ready" };
        },

        runForfeited: (args, enq) => {
          assertEvent(args.event, "runForfeited");
          enq(args.actions.forfeitRun, { self: args.self, wordChallenge: args.event.wordChallenge });
          return { target: "ready" };
        },
      },
    },

    // The run continues: wait for the player to ask for the next word
    betweenWords: {
      on: {
        nextWordRequested: (args, enq) => {
          enq(args.actions.requestNextWord, { self: args.self });
          return { target: "starting" };
        },
      },
    },
  },
});
