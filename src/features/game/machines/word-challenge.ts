// services, features, and other libraries
import { DateTime, Option, Effect } from "effect";
import { Atom } from "effect/unstable/reactivity";
import { RuntimeClient } from "@/lib/runtime-client";
import { setup, assign, assertEvent } from "xstate";
import { calculateScore, canSubmitGuess, computeKeypadState, isGuessKeyValid } from "@/features/game/domain";
import { modalMachineAtom, runSessionMachineAtom, wordMetaMachineAtom } from "@/features/game/state";
import { trackInvalidGuessSubmitted, trackValidGuessSubmitted, trackWordLost, trackWordWon } from "@/features/telemetry/state";

// types
import type { GameState } from "@/features/game/domain";
export type WordChallengeMachineContext = GameState;

// constants
import { INITIAL_GAME_STATE, MAX_TURNS, WORD_LENGTH } from "@/features/game/domain";

export const wordChallengeMachine = setup({
  types: {} as {
    events:
      | { readonly type: "gameDataLoaded"; solutions: GameState["solutions"]; dictionary: GameState["dictionary"]; theSecretWord: GameState["theSecretWord"] }
      | { readonly type: "keyPressed"; readonly pressedKey: string }
      | { readonly type: "nextWordRequested" }
      | { readonly type: "startedNewRun" }
      | { readonly type: "forfeitedRun" };
    context: GameState;
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

      // Prevent typing greyed out keys
      const keypadColors = computeKeypadState(Option.getOrThrow(context.theSecretWord), context.wordleGuesses);
      return keypadColors[normalizedKey] !== "grey";
    },
  },
  actions: {
    // Save the loaded game data provided by the game data machine
    saveGameData: assign(({ event }) => {
      assertEvent(event, "gameDataLoaded");

      return { ...INITIAL_GAME_STATE, ...event } as const satisfies GameState;
    }),

    addLetter: assign(({ context, event }) => {
      assertEvent(event, "keyPressed");
      const normalizedKey = event.pressedKey.toUpperCase();
      return {
        ...context,
        currentGuessWord: context.currentGuessWord.length < WORD_LENGTH ? context.currentGuessWord + normalizedKey : context.currentGuessWord,

        // Lazily assign startTime on the very first letter typed
        startTime: Option.isNone(context.startTime) ? Option.some(DateTime.makeUnsafe(Date.now())) : context.startTime,
      } as const satisfies GameState;
    }),

    // Remove the last letter from the current guess word
    removeLetter: assign(({ context }) => ({ ...context, currentGuessWord: context.currentGuessWord.slice(0, -1) }) as const satisfies GameState),

    // Update the game state by adding it to the list of wordle guesses and incrementing the current turn
    submitGuess: assign(
      ({ context }) =>
        ({
          ...context,
          currentGuessWord: "",
          wordleGuesses: [...context.wordleGuesses, context.currentGuessWord],
          currentTurn: context.currentTurn + 1,
        }) as const satisfies GameState
    ),

    // Calculates the player's word score based on the turn they won on and how long it took them
    calculateScore: assign(
      ({ context }) =>
        ({
          ...context,
          wordScore: Option.some(calculateScore(context.currentTurn - 1, context.startTime, DateTime.makeUnsafe(Date.now()))),
        }) as const satisfies GameState
    ),

    // Pick a new random secret word from the available solutions
    pickNewSecretWord: assign(({ context }) => {
      const solutions = Option.getOrThrow(context.solutions);
      const theSecretWord = Option.some(solutions[Math.floor(Math.random() * solutions.length)].toUpperCase());

      // *** TEST CODE ***
      // *** TEST CODE ***
      // *** TEST CODE ***
      console.log(`Secret word: ${theSecretWord.valueOrUndefined}`);
      // *** TEST CODE ***
      // *** TEST CODE ***
      // *** TEST CODE ***

      // Notify the word meta machine that the secret word has been picked
      RuntimeClient.runPromise(Atom.set(wordMetaMachineAtom, { type: "secretWordPicked", theSecretWord: Option.getOrThrow(theSecretWord) }));

      return { ...INITIAL_GAME_STATE, solutions: context.solutions, dictionary: context.dictionary, theSecretWord } as const satisfies GameState;
    }),

    // Track metrics related to submitting an invalid guess (stream 2 -> global_pulse)
    trackInvalidGuessSubmitted: () => RuntimeClient.runPromise(trackInvalidGuessSubmitted),

    // Track metrics related to submitting a valid guess (stream 2 -> global_pulse)
    trackValidGuessSubmitted: ({ context }) =>
      RuntimeClient.runPromise(
        Effect.gen(function* () {
          yield* trackValidGuessSubmitted(context);

          // Start a brand-new arcade run if it has not started yet as soon as a valid guess is submitted
          yield* Atom.set(runSessionMachineAtom, { type: "startedNewRun" });
        })
      ),

    // Track metrics related to the event of winning the game (stream 2 -> global_pulse)
    trackWordWon: ({ context }) =>
      RuntimeClient.runPromise(
        Effect.gen(function* () {
          const runSessionMachineContext = (yield* Atom.get(runSessionMachineAtom)).context;
          yield* trackWordWon(runSessionMachineContext, context);

          // Word won, bank volatile points
          const wordScore = Option.getOrThrow(context.wordScore);
          yield* Atom.set(runSessionMachineAtom, { type: "wordWon", wordScore });

          // Command the modal machine actor to open up the status modal
          yield* Atom.set(modalMachineAtom, { type: "opened", modalType: "status" });
        })
      ),

    // Track metrics related to the event of losing the game (stream 2 -> global_pulse)
    trackWordLost: ({ context }) =>
      RuntimeClient.runPromise(
        Effect.gen(function* () {
          const runSessionMachineContext = (yield* Atom.get(runSessionMachineAtom)).context;
          yield* trackWordLost(runSessionMachineContext, context);

          // Word lost, finish the active run
          yield* Atom.set(runSessionMachineAtom, { type: "wordLost" });

          // Command the modal machine actor to open up the status modal
          yield* Atom.set(modalMachineAtom, { type: "opened", modalType: "status" });
        })
      ),
  },
}).createMachine({
  id: "wordChallenge",
  context: { ...INITIAL_GAME_STATE } as const satisfies GameState,
  initial: "awaitingGameData",

  // 🌟 GLOBAL TRANSITIONS 🌟
  // Any state that does not explicitly handle these events will fall back to these rules
  on: {
    // Forfeit the active run
    forfeitedRun: { target: ".runForfeited" },

    // If settings change mid-game, restart the challenge from anywhere
    // The gameDataMachine already generated a new word and already notified the meta machine!
    gameDataLoaded: { target: ".typing", actions: "saveGameData" },
  },

  states: {
    // Waiting for the game data to be loaded
    awaitingGameData: {},

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

      on: {
        // Ensure users can recover from rejected states using the exact same generic event
        keyPressed: [
          { guard: "isBackspaceKey", target: "typing", actions: "removeLetter" },
          { guard: "isValidLetterKey", target: "typing", actions: "addLetter" },
        ],
      },
    },

    // Inputs are locked while tile flip animations play
    revealing: {
      after: { 1500: [{ guard: "isGameWon", target: "wordWon" }, { guard: "isGameLost", target: "wordLost" }, { target: "typing" }] },
    },

    // Word won, waiting for next word being requested
    wordWon: {
      entry: ["calculateScore", "trackWordWon"],

      on: { nextWordRequested: { target: "typing", actions: "pickNewSecretWord" } },
    },

    // Word lost, waiting for the new run to start
    wordLost: {
      entry: "trackWordLost",

      on: { startedNewRun: { target: "typing", actions: "pickNewSecretWord" } },
    },

    // Run forfeited, waiting for the new run to start
    runForfeited: {
      on: { startedNewRun: { target: "typing", actions: "pickNewSecretWord" } },
    },
  },
});
