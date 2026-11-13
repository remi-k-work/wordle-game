// services, features, and other libraries
import { Array, HashSet } from "effect";

// types
import type { TheSecretWord, WordChallenge } from "./models";

type ClassifiedKey =
  | { readonly kind: "enter" }
  | { readonly kind: "backspace" }
  | { readonly kind: "letter"; readonly letter: string }
  | { readonly kind: "invalid" };

// constants
import { MAX_TURNS, WORD_LENGTH } from "./constants";

const LETTER_REGEX = /^[A-ZĄĆĘŁŃÓŚŹŻ]$/u;

// Classifies a physical key once — normalizing its case — so every consumer
// shares one normalization and one validity rule instead of re-running
// `toUpperCase` and the letter regex per guard
export const classifyKey = (pressedKey: string): ClassifiedKey => {
  const letter = pressedKey.toUpperCase();
  if (letter === "ENTER") return { kind: "enter" };
  if (letter === "BACKSPACE") return { kind: "backspace" };
  return LETTER_REGEX.test(letter) ? { kind: "letter", letter } : { kind: "invalid" };
};

// Accept or reject the submitted guess
export const canSubmitGuess = (
  currentGuessWord: WordChallenge["currentGuessWord"],
  currentTurn: WordChallenge["currentTurn"],
  wordleGuesses: WordChallenge["wordleGuesses"],
  dictionary: HashSet.HashSet<TheSecretWord>
) =>
  // Within the turn limit, the right length, not a duplicate, and in the dictionary
  currentTurn <= MAX_TURNS &&
  currentGuessWord.length === WORD_LENGTH &&
  !Array.contains(wordleGuesses, currentGuessWord) &&
  HashSet.has(dictionary, currentGuessWord);
