// services, features, and other libraries
import { Effect, Array, Option, Random, pipe } from "effect";
import { computeKeypadState } from ".";

// types
import type { Keypad, TheSecretWord, WordChallenge } from ".";

// constants
import { EMP_LETTER_COUNT } from ".";

// Pure, synchronous helper that computes the list of letters safe to nuke with an EMP.
// "Safe" means: not in the secret word, not already nuked, and not yet colored by any guess.
export const computeEmpCandidates = (
  theSecretWord: TheSecretWord,
  wordleGuesses: WordChallenge["wordleGuesses"],
  keypad: Keypad,
  empNukedLetters: WordChallenge["empNukedLetters"]
) =>
  pipe(
    keypad,
    Array.filter((letter) => !theSecretWord.includes(letter)),
    Array.filter((letter) => !empNukedLetters.includes(letter)),
    Array.filter((letter) => {
      const color = computeKeypadState(theSecretWord, wordleGuesses)[letter];
      return color === undefined || color === "";
    })
  );

// Pure Effect pipeline: picks up to EMP_LETTER_COUNT (3) random unused incorrect letters.
// Returns Option.none() when fewer than EMP_LETTER_COUNT candidates remain — the caller
// should guard the lifeline deduction behind this check to never charge for nothing.
// Symmetric with calculateSonarTarget — both pure functions are self-contained and don't
// rely on caller pre-validation.
export const calculateEmpTargets = (
  theSecretWord: TheSecretWord,
  wordleGuesses: WordChallenge["wordleGuesses"],
  keypad: Keypad,
  empNukedLetters: WordChallenge["empNukedLetters"]
) =>
  Effect.gen(function* () {
    const candidates = computeEmpCandidates(theSecretWord, wordleGuesses, keypad, empNukedLetters);
    if (candidates.length < EMP_LETTER_COUNT) return Option.none();

    const shuffled = yield* Random.shuffle(candidates);
    return Option.some(Array.take(EMP_LETTER_COUNT)(shuffled));
  });
