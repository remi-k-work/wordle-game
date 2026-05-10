// services, features, and other libraries
import { DateTime, Effect, HashSet, Random } from "effect";
import { Atom } from "@effect-atom/atom-react";
import { GameData } from "@/services";
import { deriveWordleGrid, getGameStatus, processKey, deriveKeypadColors, calculateScore } from "@/domain";
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
  return deriveKeypadColors(theSecretWord, wordleGuesses);
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
    // Calculate the new game state based purely on the domain logic
    const currGameState = get(gameStateAtom);
    const dictionary = yield* get.result(gameDataSolutionsAtom);
    const keypadColors = get(keypadColorsAtom);

    /**
     * Start the timer on the very first keystroke of the game session.
     * We capture the current time using Effect's DateTime.now and store it
     * in the state to ensure we have a precise reference point for scoring.
     */
    let nextGameState = currGameState;
    if (currGameState.startTime === null && /^[a-zA-ZąĄćĆęĘłŁńŃóÓśŚźŹżŻ]$/u.test(pressedKey)) {
      const now = yield* DateTime.now;
      nextGameState = { ...currGameState, startTime: now };
    }

    const newGameState = processKey(pressedKey, nextGameState, dictionary, keypadColors);

    // If the game state has not changed, bail out
    if (currGameState === newGameState) return;

    /**
     * Check if this specific keystroke ended the game with a win.
     * If so, we capture the endTime, calculate the final score using our domain
     * logic, and commit the updated state including the score.
     */
    const prevGameStatus = getGameStatus(currGameState.currentTurn, currGameState.theSecretWord, currGameState.wordleGuesses);
    const newGameStatus = getGameStatus(newGameState.currentTurn, newGameState.theSecretWord, newGameState.wordleGuesses);

    let finalGameState = newGameState;
    if (prevGameStatus._tag === "Playing" && newGameStatus._tag === "Won" && newGameState.startTime) {
      const endTime = yield* DateTime.now;
      const score = calculateScore(newGameState.currentTurn, newGameState.startTime, endTime);
      finalGameState = { ...newGameState, score };
    }

    // Otherwise, commit the new game state
    yield* Atom.set(gameStateAtom, finalGameState);

    // If the game transitioned from "Playing" to "Won" or "Lost" just now:
    if (prevGameStatus._tag === "Playing" && newGameStatus._tag !== "Playing") {
      // Wait, so the user can see their final tiles turn green/yellow
      yield* Effect.sleep("1.5 seconds");

      // Open the status modal directly from the action!
      yield* Atom.set(activeModalAtom, "status");
    }
  })
);
