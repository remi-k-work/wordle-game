// services, features, and other libraries
import { DateTime, Option, Effect } from "effect";
import { Atom } from "effect/unstable/reactivity";
import { runClientCommand } from "@/lib/runtime-client";
import { setup, assign, assertEvent } from "xstate";
import { calculateScore, canSubmitGuess, computeKeypadState, isGuessKeyValid } from "@/features/game/domain";
import { gameFlowMachineAtom, runSessionMachineAtom } from "@/features/game/state";
import { trackInvalidGuessSubmitted, trackValidGuessSubmitted, trackWordLost, trackWordWon } from "@/features/telemetry/state";

// types
import type { TheSecretWord, WordChallenge } from "@/features/game/domain";

// constants
import { INITIAL_WORD_CHALLENGE, MAX_TURNS, WORD_LENGTH } from "@/features/game/domain";

export const wordChallengeMachine = setup({
  types: {} as {
    events:
      | { readonly type: "solutionsLanguageChanged" }
      | { readonly type: "gameDataLoaded"; readonly dictionary: WordChallenge["dictionary"] }
      | { readonly type: "secretWordPicked"; readonly theSecretWord: TheSecretWord }
      | { readonly type: "keyPressed"; readonly pressedKey: string }
      | { readonly type: "forfeitedRun" };
    context: WordChallenge;
  },
  guards: {
    isValidWord: ({ context }) => canSubmitGuess(context.currentGuessWord, context.currentTurn, context.wordleGuesses, Option.getOrThrow(context.dictionary)),

    // Do we have a winner? When the player correctly guesses the secret word, we have a winner
    isGameWon: ({ context }) => Option.getOrThrow(context.theSecretWord) === context.wordleGuesses.at(-1),

    // Do we have a loser? When the player runs out of turns, we have a loser
    isGameLost: ({ context }) => context.currentTurn > MAX_TURNS,

    isEnterKey: ({ event }) => {
      assertEvent(event, "keyPressed");
      return isGuessKeyValid(event.pressedKey) && event.pressedKey.toUpperCase() === "ENTER";
    },

    isBackspaceKey: ({ event }) => {
      assertEvent(event, "keyPressed");
      return isGuessKeyValid(event.pressedKey) && event.pressedKey.toUpperCase() === "BACKSPACE";
    },

    isValidLetterKey: ({ context, event }) => {
      assertEvent(event, "keyPressed");
      if (!isGuessKeyValid(event.pressedKey)) return false;
      const normalizedKey = event.pressedKey.toUpperCase();
      if (normalizedKey === "ENTER" || normalizedKey === "BACKSPACE") return false;

      // Prevent typing letters already ruled out by genuine guesses
      const theSecretWord = Option.getOrThrow(context.theSecretWord);
      const keypadState = computeKeypadState(theSecretWord, context.wordleGuesses);
      if (keypadState[normalizedKey] === "grey") return false;
      return true;
    },
  },
  actions: {
    // Save the dictionary provided by the game data machine (no word yet)
    saveGameData: assign(({ event }) => {
      assertEvent(event, "gameDataLoaded");
      return { ...INITIAL_WORD_CHALLENGE, dictionary: event.dictionary } as const satisfies WordChallenge;
    }),

    // Set up the board for a new puzzle with the secret word from gameDataMachine
    startNewPuzzle: assign(({ context, event }) => {
      assertEvent(event, "secretWordPicked");
      return {
        ...INITIAL_WORD_CHALLENGE,
        dictionary: context.dictionary,
        theSecretWord: Option.some(event.theSecretWord),
      } as const satisfies WordChallenge;
    }),

    addLetter: assign(({ context, event }) => {
      assertEvent(event, "keyPressed");
      const normalizedKey = event.pressedKey.toUpperCase();
      return {
        ...context,
        currentGuessWord: context.currentGuessWord.length < WORD_LENGTH ? context.currentGuessWord + normalizedKey : context.currentGuessWord,

        // Lazily assign startTime on the very first letter typed
        startTime: Option.isNone(context.startTime) ? Option.some(DateTime.makeUnsafe(Date.now())) : context.startTime,
      } as const satisfies WordChallenge;
    }),

    // Remove the last letter from the current guess word
    removeLetter: assign(({ context }) => ({ ...context, currentGuessWord: context.currentGuessWord.slice(0, -1) }) as const satisfies WordChallenge),

    // Update the game state by adding it to the list of wordle guesses and incrementing the current turn
    submitGuess: assign(
      ({ context }) =>
        ({
          ...context,
          currentGuessWord: "",
          wordleGuesses: [...context.wordleGuesses, context.currentGuessWord],
          currentTurn: context.currentTurn + 1,
        }) as const satisfies WordChallenge
    ),

    // Calculates the player's word score based on the turn they won on and how long it took them
    calculateScore: assign(
      ({ context }) =>
        ({
          ...context,
          wordScore: Option.some(calculateScore(context.currentTurn - 1, context.startTime, DateTime.makeUnsafe(Date.now()))),
        }) as const satisfies WordChallenge
    ),
    // Track metrics related to submitting an invalid guess (stream 2 -> global_pulse)
    trackInvalidGuessSubmitted: () => runClientCommand(trackInvalidGuessSubmitted),

    // Track metrics related to submitting a valid guess (stream 2 -> global_pulse)
    trackValidGuessSubmitted: ({ context }) => runClientCommand(trackValidGuessSubmitted(context)),

    // Track metrics related to the event of winning the game (stream 2 -> global_pulse)
    trackWordWon: ({ context }) =>
      runClientCommand(
        Effect.gen(function* () {
          const runSessionMachineContext = (yield* Atom.get(runSessionMachineAtom)).context;
          yield* trackWordWon(runSessionMachineContext, context);
        })
      ),

    onWordWon: ({ context }) =>
      runClientCommand(
        Effect.gen(function* () {
          const wordScore = Option.getOrThrow(context.wordScore);
          yield* Atom.set(gameFlowMachineAtom, { type: "word.won", wordScore });
        })
      ),

    // Track metrics related to the event of losing the game (stream 2 -> global_pulse)
    trackWordLost: ({ context }) =>
      runClientCommand(
        Effect.gen(function* () {
          const runSessionMachineContext = (yield* Atom.get(runSessionMachineAtom)).context;
          yield* trackWordLost(runSessionMachineContext, context);
        })
      ),

    onWordLost: () => runClientCommand(Atom.set(gameFlowMachineAtom, { type: "word.lost" })),
  },
}).createMachine({
  id: "wordChallenge",
  context: INITIAL_WORD_CHALLENGE,
  initial: "awaitingGameData",

  on: {
    // Language changed → reset to awaiting new data
    solutionsLanguageChanged: { target: ".awaitingGameData", actions: assign(() => INITIAL_WORD_CHALLENGE) },

    // Forfeit the active run
    forfeitedRun: ".runForfeited",

    // Data loaded (initial or after language change) → park in idle
    gameDataLoaded: { target: ".idle", actions: "saveGameData" },

    // New puzzle word picked by gameDataMachine → start typing
    secretWordPicked: { guard: ({ context }) => Option.isSome(context.dictionary), target: ".typing", actions: "startNewPuzzle" },
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
        keyPressed: [
          { guard: "isEnterKey", target: "validating" },
          { guard: "isBackspaceKey", actions: "removeLetter" },
          { guard: "isValidLetterKey", actions: "addLetter" },
        ],
      },
    },

    // Immediately decide whether the submitted guess is valid
    validating: {
      always: [{ guard: "isValidWord", target: "revealing", actions: ["trackValidGuessSubmitted", "submitGuess"] }, { target: "rejected" }],
    },

    // Invalid word entered; recover as soon as the user edits it
    rejected: {
      entry: "trackInvalidGuessSubmitted",

      // Only allow Backspace to manually interrupt the error state
      on: { keyPressed: [{ guard: "isBackspaceKey", target: "typing", actions: "removeLetter" }] },

      // Auto-recover back to typing after the CSS "shake" animation completes
      after: { 4000: "typing" },
    },

    // Inputs are locked while tile flip animations play
    revealing: {
      after: { 1500: [{ guard: "isGameWon", target: "wordWon" }, { guard: "isGameLost", target: "wordLost" }, { target: "typing" }] },
    },

    // Word won, waiting for next word being requested
    wordWon: {
      entry: ["calculateScore", "trackWordWon", "onWordWon"],
    },

    // Word lost, waiting for the new run to start
    wordLost: { entry: ["trackWordLost", "onWordLost"] },

    // Run forfeited, waiting for the new run to start
    runForfeited: {},
  },
});
