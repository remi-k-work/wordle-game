// services, features, and other libraries
import { Array, HashSet, Option, String } from "effect";

// types
import type { WordChallenge } from "./models";

// constants
import { MAX_TURNS, WORD_LENGTH } from "./constants";

const LETTER_REGEX = /^[A-ZĄĆĘŁŃÓŚŹŻ]$/u;
const CONTROL_KEYS = HashSet.fromIterable(["BACKSPACE", "ENTER"]);

// Validate the guess entry as the user types from the keyboard in real time
export const isGuessKeyValid = (pressedKey: string) => {
  const normalizedKey = pressedKey.toUpperCase();

  // Accept control keys and letters; reject everything else
  return HashSet.has(CONTROL_KEYS, normalizedKey) || LETTER_REGEX.test(normalizedKey);
};

// Accept or reject the submitted guess
export const canSubmitGuess = (
  currentGuessWord: WordChallenge["currentGuessWord"],
  currentTurn: WordChallenge["currentTurn"],
  wordleGuesses: WordChallenge["wordleGuesses"],
  dictionary: Option.Option.Value<WordChallenge["dictionary"]>
) =>
  // Within the turn limit, the right length, not a duplicate, and in the dictionary
  currentTurn <= MAX_TURNS &&
  String.length(currentGuessWord) === WORD_LENGTH &&
  !Array.contains(wordleGuesses, currentGuessWord) &&
  HashSet.has(dictionary, currentGuessWord);
