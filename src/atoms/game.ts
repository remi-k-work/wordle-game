// services, features, and other libraries
import { Effect, Random } from "effect";
import { Atom } from "@effect-atom/atom-react";
import { Runtime } from "./runtime";
import { languageAtom } from "./language";
import { SolutionsService } from "@/services/SolutionsService";
import { deriveWordleGrid, getGameStatus, deriveKeypadStatus, processKey } from "@/domain/game-logic";

// types
import type { GameState } from "../domain/models";

// constants
const INITIAL_GAME_STATE = { theSecretWord: "", currentGuessWord: "", wordleGuesses: [], currentTurn: 0 } as const satisfies GameState;

// Master atom storing the game state
const gameStateAtom = Atom.make<GameState>(INITIAL_GAME_STATE);

// Granular selectors derived from the master atom to minimize unnecessary re-renders
export const theSecretWordAtom = gameStateAtom.pipe(Atom.map((state) => state.theSecretWord));
export const currentGuessWordAtom = gameStateAtom.pipe(Atom.map((state) => state.currentGuessWord));
export const wordleGuessesAtom = gameStateAtom.pipe(Atom.map((state) => state.wordleGuesses));
export const currentTurnAtom = gameStateAtom.pipe(Atom.map((state) => state.currentTurn));

// Atom for the full game data (solutions and letters)
export const gameDataAtom = Runtime.atom(
  Effect.gen(function* () {
    const language = yield* Atom.get(languageAtom);
    const service = yield* SolutionsService;
    const data = yield* service.fetchGameData(language);

    // Pick a new secret word and reset the game state
    const { solutions } = data;
    const randomIndex = yield* Random.nextIntBetween(0, solutions.length);
    const randomSolution = solutions[randomIndex].word.toUpperCase();

    yield* Atom.set(gameStateAtom, { ...INITIAL_GAME_STATE, theSecretWord: randomSolution });

    return data;
  })
);

// Action to restart the game by refreshing the game data atom
export const restartGameAction = Atom.fn(() => Atom.refresh(gameDataAtom));

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
export const handleKeyAction = Atom.fn((key: string) => Atom.update(gameStateAtom, (state) => processKey(key, state)));
