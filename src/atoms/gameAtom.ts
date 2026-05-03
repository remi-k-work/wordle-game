import { Atom } from "@effect-atom/atom-react";
import { Effect, Random } from "effect";
import { GameState, GameStatus } from "@/domain/models";
import { appRuntime } from "./runtime";
import { languageAtom } from "./languageAtom";
import { SolutionsService } from "@/services/SolutionsService";
import { deriveWordleGrid, isGuessKeyEntryValid, isSubmittedGuessValid, doWeHaveAWinner, formatGuess } from "@/domain/game-logic";

const initialGameState: GameState = {
  theSecretWord: "",
  currentGuessWord: "",
  wordleGuesses: [],
  currentTurn: 0,
};

/**
 * Base writable atom for game state.
 */
export const gameStateAtom = Atom.make<GameState>(initialGameState);

/**
 * Atom for the full game data (solutions and letters).
 * When fetched or refreshed, it picks a new secret word and resets the game state.
 */
export const gameDataAtom = appRuntime.atom(
  Effect.gen(function* () {
    const language = yield* Atom.get(languageAtom);
    const service = yield* SolutionsService;
    const data = yield* service.fetchGameData(language);

    // Pick a new secret word and reset the game state
    const solutions = data.solutions;
    const randomIndex = yield* Random.nextIntBetween(0, solutions.length);
    const randomSolution = solutions[randomIndex].word.toUpperCase();

    yield* Atom.set(gameStateAtom, {
      ...initialGameState,
      theSecretWord: randomSolution,
    });

    return data;
  })
);

/**
 * Derived grid atom for rendering the 6x5 Wordle grid.
 */
export const gridAtom = Atom.make((get) => {
  const { theSecretWord, wordleGuesses } = get(gameStateAtom);
  return deriveWordleGrid(theSecretWord, wordleGuesses);
});

/**
 * Keypad status derived atom.
 * Optimized to use formatGuess directly for efficiency.
 */
export const keypadStatusAtom = Atom.make((get) => {
  const { theSecretWord, wordleGuesses } = get(gameStateAtom);
  const status: Record<string, string> = {};

  for (const guess of wordleGuesses) {
    const formatted = formatGuess(theSecretWord, guess);
    for (const tile of formatted) {
      const currentColor = status[tile.tileKey];
      if (tile.color === "green") {
        status[tile.tileKey] = "green";
      } else if (tile.color === "yellow" && currentColor !== "green") {
        status[tile.tileKey] = "yellow";
      } else if (tile.color === "grey" && !currentColor) {
        status[tile.tileKey] = "grey";
      }
    }
  }

  return status;
});

/**
 * Game status derived from current state.
 */
export const gameStatusAtom = Atom.make((get) => {
  const { currentTurn, theSecretWord, wordleGuesses } = get(gameStateAtom);
  if (doWeHaveAWinner(theSecretWord, wordleGuesses)) return GameStatus.Won();
  if (currentTurn > 5) return GameStatus.Lost();
  return GameStatus.Playing();
});

/**
 * Convenience booleans for UI components.
 */
export const isGameFinishedAtom = Atom.make((get) => get(gameStatusAtom)._tag !== "Playing");

export const isWinnerAtom = Atom.make((get) => get(gameStatusAtom)._tag === "Won");

/**
 * Action to handle all key presses (letters, Backspace, Enter).
 */
export const handleKeyAction = Atom.fn((key: string, get) =>
  Effect.gen(function* () {
    const isFinished = yield* Atom.get(isGameFinishedAtom);
    if (isFinished || !isGuessKeyEntryValid(key)) return;

    const state = yield* Atom.get(gameStateAtom);

    if (key === "Backspace") {
      yield* Atom.update(gameStateAtom, (s) => ({
        ...s,
        currentGuessWord: s.currentGuessWord.slice(0, -1),
      }));
      return;
    }

    if (key === "Enter") {
      if (isSubmittedGuessValid(key, state.currentGuessWord, state.currentTurn, state.wordleGuesses)) {
        yield* Atom.update(gameStateAtom, (s) => ({
          ...s,
          wordleGuesses: [...s.wordleGuesses, s.currentGuessWord],
          currentTurn: s.currentTurn + 1,
          currentGuessWord: "",
        }));
      }
      return;
    }

    if (state.currentGuessWord.length < 5) {
      yield* Atom.update(gameStateAtom, (s) => ({
        ...s,
        currentGuessWord: s.currentGuessWord + key.toUpperCase(),
      }));
    }
  })
);

/**
 * Action to restart the game by refreshing the data atom.
 */
export const restartGameAction = Atom.fn((_, get) => Atom.refresh(gameDataAtom));
