// services, features, and other libraries
import { DateTime, Option, HashSet, Effect } from "effect";
import { Atom } from "effect/unstable/reactivity";
import { RuntimeClient } from "@/lib/runtime-client";
import { setup, assign, assertEvent, fromPromise } from "xstate";
import { calculateScore, canSubmitGuess, getGameStatus } from "@/features/game/domain";
import { modalMachineAtom, runSessionMachineAtom } from "@/features/game/state";
import { trackWordLostEvent, trackWordWonEvent } from "@/features/telemetry/state";

// types
import type { GameState } from "@/features/game/domain";

// constants
import { INITIAL_GAME_STATE, WORD_LENGTH } from "@/features/game/domain";

const onGuessRevealedActor = fromPromise(async ({ signal }: { signal: AbortSignal }) =>
  RuntimeClient.runPromise(
    Effect.gen(function* () {
      // The new run session officially starts when the first guess is revealed
      const now = yield* DateTime.now;
      yield* Atom.set(runSessionMachineAtom, { type: "started", now });
    }),
    { signal }
  )
);

const onWordWonActor = fromPromise(async ({ input: { context }, signal }: { input: { context: GameState }; signal: AbortSignal }) =>
  RuntimeClient.runPromise(
    Effect.gen(function* () {
      // Bank volatile points into the persistent run session
      const wordScore = Option.getOrThrow(context.wordScore);
      yield* Atom.set(runSessionMachineAtom, { type: "wordBanked", wordScore });

      // Track metrics related to the event of winning the game
      yield* trackWordWonEvent(context, wordScore);

      // Command the modal machine actor to open up the status modal
      yield* Atom.set(modalMachineAtom, { type: "opened", modalType: "status" });
    }),
    { signal }
  )
);

const onWordLostActor = fromPromise(async ({ signal }: { signal: AbortSignal }) =>
  RuntimeClient.runPromise(
    Effect.gen(function* () {
      // Track metrics related to the event of losing the game
      yield* trackWordLostEvent();

      // Close out the active run and record it as the latest completed run
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
      | { readonly type: "solutionsLoaded"; solutions: GameState["solutions"]; dictionary: GameState["solutions"] }
      | { readonly type: "letterPressed"; readonly letter: string }
      | { readonly type: "backspacePressed" }
      | { readonly type: "enterPressed" }
      | { readonly type: "nextWordRequested" };
    context: GameState;
  },
  guards: {
    isValidWord: ({ context }) => canSubmitGuess(context.currentGuessWord, context.currentTurn, context.wordleGuesses, Option.getOrThrow(context.dictionary)),
    isGameWon: ({ context }) => getGameStatus(context.currentTurn, context.theSecretWord, context.wordleGuesses)._tag === "Won",
    isGameLost: ({ context }) => getGameStatus(context.currentTurn, context.theSecretWord, context.wordleGuesses)._tag === "Lost",
  },
  actions: {
    // Initialize by creating the dictionary of valid words and randomly selecting the secret word
    initialize: assign(({ event }) => {
      assertEvent(event, "solutionsLoaded");
      const solutions = Option.getOrThrow(event.solutions);
      const dictionary = Option.getOrThrow(event.dictionary);
      const theSecretWord = solutions[Math.floor(Math.random() * solutions.length)].toUpperCase();

      // *** TEST CODE ***
      // *** TEST CODE ***
      // *** TEST CODE ***
      console.log(`Secret word: ${theSecretWord}`);
      // *** TEST CODE ***
      // *** TEST CODE ***
      // *** TEST CODE ***

      return {
        ...INITIAL_GAME_STATE,
        solutions: Option.some(solutions),

        // This is the more forgiving dictionary of valid words we can enter (no lemmas only) (HashSet for O(1) lookups)
        dictionary: Option.some(HashSet.fromIterable(dictionary.map((word) => word.toUpperCase()))),

        theSecretWord,
      } as const satisfies GameState;
    }),

    addLetter: assign({
      currentGuessWord: ({ context, event }) => {
        assertEvent(event, "letterPressed");
        return context.currentGuessWord.length < WORD_LENGTH ? context.currentGuessWord + event.letter : context.currentGuessWord;
      },

      // Lazily assign startTime on the very first letter typed
      startTime: ({ context }) => (Option.isNone(context.startTime) ? Option.some(DateTime.makeUnsafe(Date.now())) : context.startTime),
    }),

    // Remove the last letter from the current guess word
    removeLetter: assign({ currentGuessWord: ({ context }) => context.currentGuessWord.slice(0, -1) }),

    // Update the game state by adding it to the list of wordle guesses and incrementing the current turn
    submitGuess: assign({
      wordleGuesses: ({ context }) => [...context.wordleGuesses, context.currentGuessWord],
      currentGuessWord: () => "",
      currentTurn: ({ context }) => context.currentTurn + 1,
    }),
    calculateScore: assign({
      wordScore: ({ context }) => Option.some(calculateScore(context.currentTurn - 1, context.startTime, DateTime.makeUnsafe(Date.now()))),
    }),
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
  actors: { onGuessRevealedActor, onWordWonActor, onWordLostActor },
}).createMachine({
  id: "wordChallenge",
  context: { ...INITIAL_GAME_STATE },
  initial: "idle",

  states: {
    // Waiting for solutions + dictionary to be loaded
    idle: {
      on: {
        solutionsLoaded: { target: "typing", actions: "initialize" },
      },
    },

    // User is actively building their current guess
    typing: {
      on: {
        letterPressed: { actions: "addLetter" },
        backspacePressed: { actions: "removeLetter" },
        enterPressed: { target: "validating" },
      },
    },

    // Immediately decide whether the submitted guess is valid
    validating: {
      always: [{ guard: "isValidWord", target: "revealing", actions: "submitGuess" }, { target: "rejected" }],
    },

    // Invalid word entered; recover as soon as the user edits it
    rejected: {
      on: {
        letterPressed: { target: "typing", actions: "addLetter" },
        backspacePressed: { target: "typing", actions: "removeLetter" },
      },
    },

    // Inputs are locked while tile flip animations play
    revealing: {
      // The new run session officially starts when the first guess is revealed
      invoke: { src: "onGuessRevealedActor" },

      after: {
        1500: [{ guard: "isGameWon", target: "won" }, { guard: "isGameLost", target: "lost" }, { target: "typing" }],
      },
    },

    // Challenge completed successfully; waiting for next word
    won: {
      entry: "calculateScore",

      invoke: {
        src: "onWordWonActor",
        input: ({ context }) => ({ context }),
      },

      on: {
        nextWordRequested: {
          target: "typing",
          actions: "nextChallenge",
        },
      },
    },

    // Challenge failed; waiting for next word
    lost: {
      invoke: {
        src: "onWordLostActor",
      },

      on: {
        nextWordRequested: {
          target: "typing",
          actions: "nextChallenge",
        },
      },
    },
  },
});
