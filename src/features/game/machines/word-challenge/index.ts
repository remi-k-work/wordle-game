// services, features, and other libraries
import { Option } from "effect";
import { assertEvent } from "xstate";
import { setup } from "./setup";
import { addLetterContext, calculateScoreContext, removeLetterContext, saveGameDataContext, startNewPuzzleContext, submitGuessContext } from "./helpers";

// constants
import { INITIAL_WORD_CHALLENGE } from "./constants";

export const wordChallengeMachine = setup.createMachine({
  id: "wordChallenge",
  context: INITIAL_WORD_CHALLENGE(),
  initial: "awaitingGameData",

  on: {
    // Language changed → reset to awaiting new data
    solutionsLanguageChanged: { target: ".awaitingGameData", context: () => INITIAL_WORD_CHALLENGE() },

    // Forfeit the active run
    runForfeited: { target: ".runForfeited" },

    // Data loaded (initial or after language change) → park in idle
    gameDataLoaded: {
      target: ".idle",
      context: (args) => {
        assertEvent(args.event, "gameDataLoaded");
        return saveGameDataContext(args.event.dictionary);
      },
    },

    // New puzzle word picked by gameDataMachine → start typing (only once a dictionary exists)
    secretWordPicked: (args) => {
      assertEvent(args.event, "secretWordPicked");
      const dictionary = args.context.dictionary;
      if (!Option.isSome(dictionary)) return;
      return { target: ".typing", context: startNewPuzzleContext(dictionary, args.event.theSecretWord) };
    },
  },

  states: {
    // Waiting for the game data to be loaded
    awaitingGameData: {},

    // Data is loaded but no puzzle is active — waiting for "Start New Run" or "Next Word"
    idle: {},

    // User is actively building their current guess
    typing: {
      on: {
        // The machine now routes the raw keyboard input natively
        keyPressed: (args) => {
          if (args.guards.isEnterKey(args)) return { target: "validating" };
          if (args.guards.isBackspaceKey(args)) return { context: removeLetterContext(args.context) };
          if (args.guards.isValidLetterKey(args)) {
            assertEvent(args.event, "keyPressed");
            return { context: addLetterContext(args.context, args.event.pressedKey) };
          }
        },
      },
    },

    // Immediately decide whether the submitted guess is valid
    validating: {
      always: (args, enq) => {
        if (args.guards.isValidWord(args)) {
          enq(args.actions.trackValidGuessSubmitted, { self: args.self, wordChallenge: args.context });
          return { target: "revealing", context: submitGuessContext(args.context) };
        }
        return { target: "rejected" };
      },
    },

    // Invalid word entered; recover as soon as the user edits it
    rejected: {
      entry: (args, enq) => {
        enq(args.actions.trackInvalidGuessSubmitted, { self: args.self });
      },

      // Only allow Backspace to manually interrupt the error state
      on: {
        keyPressed: (args) => {
          if (args.guards.isBackspaceKey(args)) return { target: "typing", context: removeLetterContext(args.context) };
        },
      },

      // Auto-recover back to typing after the CSS "shake" animation completes
      after: { 4000: { target: "typing" } },
    },

    // Inputs are locked while tile flip animations play
    revealing: {
      after: {
        1500: (args) => {
          if (args.guards.isGameWon(args)) return { target: "wordWon" };
          if (args.guards.isGameLost(args)) return { target: "wordLost" };
          return { target: "typing" };
        },
      },
    },

    // Word won, waiting for next word being requested
    wordWon: {
      entry: (args, enq) => {
        const context = calculateScoreContext(args.context);
        enq(args.actions.trackWordWon, { self: args.self, wordChallenge: context });
        enq(args.actions.onWordWon, { self: args.self, wordChallenge: context });
        return { context };
      },
    },

    // Word lost, waiting for the new run to start
    wordLost: {
      entry: (args, enq) => {
        enq(args.actions.trackWordLost, { self: args.self, wordChallenge: args.context });
        enq(args.actions.onWordLost, { self: args.self });
      },
    },

    // Run forfeited, waiting for the new run to start
    runForfeited: {},
  },
});
