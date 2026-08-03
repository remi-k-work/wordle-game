// services, features, and other libraries
import { Effect, Array, Option, Random, pipe } from "effect";
import { computeKeypadState } from "@/features/game/domain";

// types
import type { Keypad, TheSecretWord } from "@/features/game/domain";

// constants
import { EMP_LETTER_COUNT } from ".";

export const computeEmpCandidates = (
  theSecretWord: TheSecretWord,
  wordleGuesses: ReadonlyArray<TheSecretWord>,
  keypad: Keypad,
  empNukedLetters: ReadonlyArray<string>
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
