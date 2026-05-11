// services, features, and other libraries
import { DateTime, Effect, HashSet, Random, Match } from "effect";
import { Atom } from "@effect-atom/atom-react";
import { GameData } from "@/services";
import { deriveWordleGrid, getGameStatus, calculateScore, computeKeypadState, parseKey, applyGameAction } from "@/domain";
import { Runtime } from "./runtime";
import { activeModalAtom, languageAtom } from ".";

// types
import type { GameState } from "@/domain";

// constants
import { INITIAL_GAME_STATE } from "@/domain";

// Master atom storing the game state
const gameStateAtom = Atom.make<GameState>(INITIAL_GAME_STATE);

// Granular selectors derived from the master atom to minimize unnecessary re-renders
export const theSecretWordAtom = gameStateAtom.pipe(Atom.map((state) => state.theSecretWord));
export const currentGuessWordAtom = gameStateAtom.pipe(Atom.map((state) => state.currentGuessWord));
export const wordleGuessesAtom = gameStateAtom.pipe(Atom.map((state) => state.wordleGuesses));
export const currentTurnAtom = gameStateAtom.pipe(Atom.map((state) => state.currentTurn));
export const isInvalidGuessAtom = gameStateAtom.pipe(Atom.map((state) => state.isInvalidGuess));
export const scoreAtom = gameStateAtom.pipe(Atom.map((state) => state.score));
export const startTimeAtom = gameStateAtom.pipe(Atom.map((state) => state.startTime));

// Atom for the game data (solutions)
export const gameDataSolutionsAtom = Runtime.atom(
  Effect.gen(function* () {
    const language = yield* Atom.get(languageAtom);
    const service = yield* GameData;
    const solutions = yield* service.fetchSolutions(language);

    // Pick a new secret word and reset the game state
    const randomIndex = yield* Random.nextIntBetween(0, solutions.length);
    const randomSolution = solutions[randomIndex].toUpperCase();

    // *** TEST CODE ***
    // *** TEST CODE ***
    // *** TEST CODE ***
    yield* Effect.log("Secret word: " + randomSolution);
    // *** TEST CODE ***
    // *** TEST CODE ***
    // *** TEST CODE ***

    yield* Atom.set(gameStateAtom, { ...INITIAL_GAME_STATE, theSecretWord: randomSolution });

    // Return as a HashSet for O(1) lookups
    return HashSet.fromIterable(solutions.map((solution) => solution.toUpperCase()));
  })
);

// Atom for the game data (keypad)
export const gameDataKeypadAtom = Runtime.atom(
  Effect.gen(function* () {
    const language = yield* Atom.get(languageAtom);
    const service = yield* GameData;
    return yield* service.fetchKeypad(language);
  })
);

// Action to restart the game by refreshing the game data atoms
export const restartGameAction = Atom.fn(() =>
  Effect.gen(function* () {
    yield* Atom.refresh(gameDataSolutionsAtom);
    yield* Atom.refresh(gameDataKeypadAtom);
  })
);

// Derived grid atom for rendering the 6x5 wordle grid
export const wordleGridAtom = Atom.make((get) => {
  const theSecretWord = get(theSecretWordAtom);
  const wordleGuesses = get(wordleGuessesAtom);
  return deriveWordleGrid(theSecretWord, wordleGuesses);
});

// Derived keypad colors atom
export const keypadColorsAtom = Atom.make((get) => {
  const theSecretWord = get(theSecretWordAtom);
  const wordleGuesses = get(wordleGuessesAtom);
  return computeKeypadState(theSecretWord, wordleGuesses);
});

// Game status derived from current game state
export const gameStatusAtom = Atom.make((get) => {
  const currentTurn = get(currentTurnAtom);
  const theSecretWord = get(theSecretWordAtom);
  const wordleGuesses = get(wordleGuessesAtom);
  return getGameStatus(currentTurn, theSecretWord, wordleGuesses);
});

// Action to handle all key presses (letters, backspace, and enter)
export const handleKeyAction = Atom.fn((pressedKey: string, get) =>
  Effect.gen(function* () {
    const currGameState = get(gameStateAtom);
    const keypadColors = get(keypadColorsAtom);

    // Map raw input to domain action and exit early if it is junk
    const action = parseKey(pressedKey, keypadColors);
    if (action._tag === "Ignore") return;

    // Gather pure dependencies
    const dictionary = yield* get.result(gameDataSolutionsAtom);
    const now = yield* DateTime.now;

    // Process via purely functional domain logic
    const nextGameState = applyGameAction(currGameState, action, dictionary, now);

    // Referential equality check (anything has changed?)
    if (currGameState === nextGameState) return;

    // Detect transitions
    const prevStatus = getGameStatus(currGameState.currentTurn, currGameState.theSecretWord, currGameState.wordleGuesses);
    const nextStatus = getGameStatus(nextGameState.currentTurn, nextGameState.theSecretWord, nextGameState.wordleGuesses);

    // Calculate Final Score if we just Won
    const finalGameState = yield* Match.value(nextStatus).pipe(
      Match.when({ _tag: "Won" }, () =>
        Effect.gen(function* () {
          if (prevStatus._tag === "Playing" && nextGameState.startTime) {
            const endTime = yield* DateTime.now;
            const score = calculateScore(nextGameState.currentTurn, nextGameState.startTime, endTime);
            return { ...nextGameState, score };
          }
          return nextGameState;
        })
      ),
      Match.orElse(() => Effect.succeed(nextGameState))
    );

    // Update the game state atom
    yield* Atom.set(gameStateAtom, finalGameState);

    // Handle Side Effects (Modals)
    if (prevStatus._tag === "Playing" && nextStatus._tag !== "Playing") {
      yield* Effect.sleep("1.5 seconds");
      yield* Atom.set(activeModalAtom, "status");
    }
  })
);
