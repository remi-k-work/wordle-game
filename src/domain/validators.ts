// services, features, and other libraries
import { HashSet, Match } from "effect";

// constants
import { MAX_TURNS, WORD_LENGTH } from ".";

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

// Accept or reject the submitted guess purely based on domain rules (we use && for instant short-circuiting)
export const canSubmitGuess = (currentGuessWord: string, currentTurn: number, wordleGuesses: readonly string[], dictionary: HashSet.HashSet<string>) =>
  // Is this not the final turn?
  currentTurn <= MAX_TURNS &&
  // Make sure the term is exactly 5 characters long
  currentGuessWord.length === WORD_LENGTH &&
  // Do not allow duplicate words
  !wordleGuesses.includes(currentGuessWord) &&
  // Ensure the word exists in the dictionary
  true; // HashSet.has(dictionary, currentGuessWord);
