// services, features, and other libraries
import { Array, HashSet, Match, pipe } from "effect";

// constants
const LETTER_REGEX = /^[A-ZĄĆĘŁŃÓŚŹŻ]$/u;
const CONTROL_KEYS = HashSet.fromIterable(["BACKSPACE", "ENTER"]);

// Validate the guess entry as the user types from the keyboard in real time
export const isGuessKeyValid = (pressedKey: string) =>
  Match.value(pressedKey.toUpperCase()).pipe(
    // Only legitimate and recognized keys are accepted, while everything else is rejected
    Match.when(
      (normalizedKey) => HashSet.has(CONTROL_KEYS, normalizedKey),
      () => true
    ),

    // Apart from the foregoing, only letters will be accepted
    Match.when(
      (normalizedKey) => LETTER_REGEX.test(normalizedKey),
      () => true
    ),

    // All other keys are rejected
    Match.orElse(() => false)
  );

// Accept or reject the submitted guess purely based on domain rules
export const canSubmitGuess = (currentGuessWord: string, currentTurn: number, wordleGuesses: readonly string[], dictionary: HashSet.HashSet<string>) =>
  pipe(
    [
      // Is this not the final turn?
      currentTurn <= 5,

      // Do not allow duplicate words
      !wordleGuesses.includes(currentGuessWord),

      // Make sure the term is exactly 5 characters long
      currentGuessWord.length === 5,

      // Ensure the word exists in the dictionary
      HashSet.has(dictionary, currentGuessWord),
    ],
    Array.every(Boolean)
  );
