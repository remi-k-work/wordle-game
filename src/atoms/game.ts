// services, features, and other libraries
import { Effect, Random } from "effect";
import { Atom } from "@effect-atom/atom-react";
import { Runtime } from "./runtime";
import { languageAtom } from "./language";
import { GameData } from "@/services";
import { deriveWordleGrid, getGameStatus, deriveKeypadStatus, processKey } from "@/domain";

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

// Convenience booleans for UI components
export const isGameFinishedAtom = Atom.make((get) => get(gameStatusAtom)._tag !== "Playing");
export const isWinnerAtom = Atom.make((get) => get(gameStatusAtom)._tag === "Won");

// Action to handle all key presses (letters, backspace, and enter)
export const handleKeyAction = Atom.fn((key: string, get) => Atom.update(gameStateAtom, (state) => processKey(key, state)));
