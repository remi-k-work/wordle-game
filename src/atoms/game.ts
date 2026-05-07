// services, features, and other libraries
import { Effect, Random } from "effect";
import { Atom } from "@effect-atom/atom-react";
import { GameData } from "@/services";
import { deriveWordleGrid, getGameStatus, deriveKeypadStatus, processKey } from "@/domain";
import { Runtime } from "./runtime";
import { activeModalAtom, languageAtom } from ".";

// types
import type { GameState } from "@/domain";

// constants
const INITIAL_GAME_STATE = { theSecretWord: "", currentGuessWord: "", wordleGuesses: [], currentTurn: 0 } as const satisfies GameState;

// Master atom storing the game state
const gameStateAtom = Atom.make<GameState>(INITIAL_GAME_STATE);

// Granular selectors derived from the master atom to minimize unnecessary re-renders
export const theSecretWordAtom = gameStateAtom.pipe(Atom.map((state) => state.theSecretWord));
export const currentGuessWordAtom = gameStateAtom.pipe(Atom.map((state) => state.currentGuessWord));
export const wordleGuessesAtom = gameStateAtom.pipe(Atom.map((state) => state.wordleGuesses));
export const currentTurnAtom = gameStateAtom.pipe(Atom.map((state) => state.currentTurn));

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

    return solutions;
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

// Keypad status derived atom
export const keypadStatusAtom = Atom.make((get) => {
  const theSecretWord = get(theSecretWordAtom);
  const wordleGuesses = get(wordleGuessesAtom);
  return deriveKeypadStatus(theSecretWord, wordleGuesses);
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
    const newGameState = processKey(pressedKey, currGameState);

    // If the game state has not changed, bail out
    if (currGameState === newGameState) return;

    // Otherwise, commit the new game state
    yield* Atom.set(gameStateAtom, newGameState);

    // Check if this specific keystroke ended the game
    const prevGameStatus = getGameStatus(currGameState.currentTurn, currGameState.theSecretWord, currGameState.wordleGuesses);
    const newGameStatus = getGameStatus(newGameState.currentTurn, newGameState.theSecretWord, newGameState.wordleGuesses);

    // If the game transitioned from "Playing" to "Won" or "Lost" just now:
    if (prevGameStatus._tag === "Playing" && newGameStatus._tag !== "Playing") {
      // Wait, so the user can see their final tiles turn green/yellow
      yield* Effect.sleep("1.5 seconds");

      // Open the status modal directly from the action!
      yield* Atom.set(activeModalAtom, "status");
    }
  })
);
