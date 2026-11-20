// services, features, and other libraries
import { Array, DateTime, Option, String } from "effect";
import { calculateScore, computeGreyLetters } from "@/features/game/domain/game-logic";

// types
import type { TheSecretWord } from "@/features/game/domain/models";
import type { WordChallenge } from "./models";

// constants
import { WORD_LENGTH } from "@/features/game/domain/constants";
import { INITIAL_WORD_CHALLENGE } from "./constants";

// Save the dictionary provided by the game data machine (no word yet)
export const saveGameDataContext = (dictionary: WordChallenge["dictionary"]): WordChallenge => ({ ...INITIAL_WORD_CHALLENGE(), dictionary });

// Set up the board for a new puzzle with the secret word from gameDataMachine
export const startNewPuzzleContext = (dictionary: WordChallenge["dictionary"], theSecretWord: TheSecretWord): WordChallenge => ({
  ...INITIAL_WORD_CHALLENGE(),
  dictionary,
  theSecretWord: Option.some(theSecretWord),
});

// Append a letter (never past full length); lazily start the clock on the first letter
export const addLetterContext = (context: WordChallenge, pressedKey: string): WordChallenge => ({
  ...context,
  currentGuessWord: context.currentGuessWord.length < WORD_LENGTH ? context.currentGuessWord + pressedKey.toUpperCase() : context.currentGuessWord,
  startTime: Option.orElseSome(context.startTime, () => DateTime.nowUnsafe()),
});

// Remove the last letter from the current guess word
export const removeLetterContext = (context: WordChallenge): WordChallenge => ({ ...context, currentGuessWord: context.currentGuessWord.slice(0, -1) });

// Record the guess, advance the turn, and recompute grey letters once per submission
export const submitGuessContext = (context: WordChallenge): WordChallenge => {
  const wordleGuesses = Array.append(context.wordleGuesses, context.currentGuessWord);
  return {
    ...context,
    currentGuessWord: String.empty,
    wordleGuesses,
    currentTurn: context.currentTurn + 1,
    greyLetters: Option.isSome(context.theSecretWord) ? computeGreyLetters(context.theSecretWord.value, wordleGuesses) : context.greyLetters,
  };
};

// Calculate the player's word score from the turn they won on and how long it took
export const calculateScoreContext = (context: WordChallenge): WordChallenge => ({
  ...context,
  wordScore: Option.some(calculateScore(context.currentTurn - 1, context.startTime, DateTime.nowUnsafe())),
});
