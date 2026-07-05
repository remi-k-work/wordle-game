// services, features, and other libraries
import { DateTime, Option, Effect } from "effect";
import { Atom } from "effect/unstable/reactivity";
import { RuntimeClient } from "@/lib/runtime-client";
import { setup, assign, assertEvent, fromPromise } from "xstate";
import { calculateScore, canSubmitGuess, computeKeypadState, isGuessKeyValid } from "@/features/game/domain";
import { modalMachineAtom, runSessionMachineAtom } from "@/features/game/state";
import { trackInvalidGuessSubmitted, trackValidGuessSubmitted, trackWordLost, trackWordWon } from "@/features/telemetry/state";

// types
import type { GameState } from "@/features/game/domain";
export type WordChallengeMachineContext = GameState;

// constants
import { INITIAL_GAME_STATE, MAX_TURNS, WORD_LENGTH } from "@/features/game/domain";

const onGuessRejectedActor = fromPromise(async ({ signal }: { signal: AbortSignal }) => RuntimeClient.runPromise(trackInvalidGuessSubmitted, { signal }));

const onGuessRevealedActor = fromPromise(async ({ input: { context }, signal }: { input: { context: GameState }; signal: AbortSignal }) =>
  RuntimeClient.runPromise(
    Effect.gen(function* () {
      // Track metrics related to submitting a valid guess (stream 2 -> global_pulse)
      yield* trackValidGuessSubmitted(context);

      // The new run session officially starts when the first guess is revealed
      yield* Atom.set(runSessionMachineAtom, { type: "started" });
    }),
    { signal }
  )
);

const onWordWonActor = fromPromise(async ({ input: { context }, signal }: { input: { context: GameState }; signal: AbortSignal }) =>
  RuntimeClient.runPromise(
    Effect.gen(function* () {
      // Track metrics related to the event of winning the game (stream 2 -> global_pulse)
      const runSessionMachineContext = (yield* Atom.get(runSessionMachineAtom)).context;
      yield* trackWordWon(runSessionMachineContext, context);

      // Bank volatile points into the persistent run session
      const wordScore = Option.getOrThrow(context.wordScore);
      yield* Atom.set(runSessionMachineAtom, { type: "wordBanked", wordScore });

      // Command the modal machine actor to open up the status modal
      yield* Atom.set(modalMachineAtom, { type: "opened", modalType: "status" });
    }),
    { signal }
  )
);

const onWordLostActor = fromPromise(async ({ input: { context }, signal }: { input: { context: GameState }; signal: AbortSignal }) =>
  RuntimeClient.runPromise(
    Effect.gen(function* () {
      // Track metrics related to the event of losing the game (stream 2 -> global_pulse)
      const runSessionMachineContext = (yield* Atom.get(runSessionMachineAtom)).context;
      yield* trackWordLost(runSessionMachineContext, context);

      // Close out the active run by clearing identifiers, but LEAVE runScore and streak intact for the UI!
      yield* Atom.set(runSessionMachineAtom, { type: "finished" });

      // Command the modal machine actor to open up the status modal
      yield* Atom.set(modalMachineAtom, { type: "opened", modalType: "status" });
    }),
    { signal }
  )
);

export const wordChallengeMachine = setup({
  types: {} as {
    events:
      | { readonly type: "gameDataLoaded"; solutions: GameState["solutions"]; dictionary: GameState["dictionary"]; theSecretWord: GameState["theSecretWord"] }
      | { readonly type: "keyPressed"; readonly pressedKey: string }
      | { readonly type: "nextWordRequested" };
    context: GameState;
  },
  guards: {
    isValidWord: ({ context }) => canSubmitGuess(context.currentGuessWord, context.currentTurn, context.wordleGuesses, Option.getOrThrow(context.dictionary)),

    // Do we have a winner? When the player correctly guesses the secret word, we have a winner
    isGameWon: ({ context }) => context.theSecretWord === context.wordleGuesses.at(-1),

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
      const keypadColors = computeKeypadState(context.theSecretWord, context.wordleGuesses);
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

    // Transition to the next word challenge while maintaining the current run streak
    nextChallenge: assign(({ context }) => {
      const solutions = Option.getOrThrow(context.solutions);
      const theSecretWord = solutions[Math.floor(Math.random() * solutions.length)].toUpperCase();

      // *** TEST CODE ***
      // *** TEST CODE ***
      // *** TEST CODE ***
      console.log(`Secret word: ${theSecretWord}`);
      // *** TEST CODE ***
      // *** TEST CODE ***
      // *** TEST CODE ***

      return { ...INITIAL_GAME_STATE, solutions: context.solutions, dictionary: context.dictionary, theSecretWord } as const satisfies GameState;
    }),
  },
  actors: { onGuessRejectedActor, onGuessRevealedActor, onWordWonActor, onWordLostActor },
}).createMachine({
  id: "wordChallenge",
  context: { ...INITIAL_GAME_STATE } as const satisfies GameState,
  initial: "idle",

  states: {
    // Waiting for the game data to be loaded
    idle: {
      on: {
        gameDataLoaded: { target: "typing", actions: "saveGameData" },
      },
    },

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
      always: [{ guard: "isValidWord", target: "revealing", actions: "submitGuess" }, { target: "rejected" }],
    },

    // Invalid word entered; recover as soon as the user edits it
    rejected: {
      invoke: { src: "onGuessRejectedActor" },

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
      // The new run session officially starts when the first guess is revealed
      invoke: { src: "onGuessRevealedActor", input: ({ context }) => ({ context }) },

      after: {
        1500: [{ guard: "isGameWon", target: "won" }, { guard: "isGameLost", target: "lost" }, { target: "typing" }],
      },
    },

    // Challenge completed successfully; waiting for next word
    won: {
      entry: "calculateScore",
      invoke: { src: "onWordWonActor", input: ({ context }) => ({ context }) },

      on: {
        nextWordRequested: {
          target: "typing",
          actions: "nextChallenge",
        },
      },
    },

    // Challenge failed; waiting for next word
    lost: {
      invoke: { src: "onWordLostActor", input: ({ context }) => ({ context }) },

      on: {
        nextWordRequested: {
          target: "typing",
          actions: "nextChallenge",
        },
      },
    },
  },
});
