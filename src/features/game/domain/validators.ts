// services, features, and other libraries
import { Array, HashSet, Match, Option, String } from "effect";

// types
import type { WordChallenge } from ".";

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

// Accept or reject the submitted guess — Effect/Match exhaustive on domain rules
export const canSubmitGuess = (
  currentGuessWord: WordChallenge["currentGuessWord"],
  currentTurn: WordChallenge["currentTurn"],
  wordleGuesses: WordChallenge["wordleGuesses"],
  dictionary: Option.Option.Value<WordChallenge["dictionary"]>
) =>
  Match.value({ currentGuessWord, currentTurn, wordleGuesses, dictionary }).pipe(
    // Past the final turn → reject
    Match.when(
      ({ currentTurn }) => currentTurn > MAX_TURNS,
      () => false
    ),
    // Wrong word length (Effect String.length, not raw .length)
    Match.when(
      ({ currentGuessWord }) => String.length(currentGuessWord) !== WORD_LENGTH,
      () => false
    ),
    // Duplicate word already guessed
    Match.when(
      ({ currentGuessWord, wordleGuesses }) => Array.contains(wordleGuesses, currentGuessWord),
      () => false
    ),
    // Not in dictionary
    Match.when(
      ({ currentGuessWord, dictionary }) => !HashSet.has(dictionary, currentGuessWord),
      () => false
    ),
    Match.orElse(() => true)
  );
