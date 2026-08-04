// services, features, and other libraries
import { Effect, Array, Option, Random, pipe } from "effect";
import { computeKeypadState } from "@/features/game/domain";

// types
import type { Keypad, TheSecretWord } from "@/features/game/domain";

// constants
import { EMP_LETTER_COUNT } from ".";

// EMP nukes letters from the virtual keyboard, permanently greying them out.
// Eligibility: a letter is NOT in the secret word, has NOT been nuked already,
// and has NOT been discovered by the player via any prior guess.
export const computeEmpCandidates = (
  theSecretWord: TheSecretWord,
  wordleGuesses: ReadonlyArray<TheSecretWord>,
  keypad: Keypad,
  empNukedLetters: ReadonlyArray<string>
) =>
  pipe(
    keypad,
    // Exclude letters that are anywhere in the secret word
    Array.filter((letter) => !theSecretWord.includes(letter)),
    // Exclude letters already nuked by previous EMP activations
    Array.filter((letter) => !empNukedLetters.includes(letter)),
    // Exclude letters the player has already discovered through guessing (green/yellow from keypad)
    Array.filter((letter) => {
      const color = computeKeypadState(theSecretWord, wordleGuesses)[letter];
      return color === undefined || color === "";
    })
  );

// EMP_LETTER_COUNT (currently 3) controls how many letters to nuke per activation.
// If eligible candidates drop below that count the hack is unavailable.
export const calculateEmpTargets = (
  theSecretWord: TheSecretWord,
  wordleGuesses: ReadonlyArray<TheSecretWord>,
  keypad: Keypad,
  empNukedLetters: ReadonlyArray<string>
) =>
  Effect.gen(function* () {
    const candidates = computeEmpCandidates(theSecretWord, wordleGuesses, keypad, empNukedLetters);
    if (candidates.length < EMP_LETTER_COUNT) return Option.none();
    return Option.some(Array.take(EMP_LETTER_COUNT)(yield* Random.shuffle(candidates)));
  });
