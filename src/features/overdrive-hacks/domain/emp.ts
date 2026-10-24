// services, features, and other libraries
import { Effect, Array, HashMap, HashSet, Option, Random } from "effect";
import { computeKeypadState } from "@/features/game/domain/game-logic";

// types
import type { Keypad, TheSecretWord } from "@/features/game/domain/models";

// constants
import { EMP_LETTER_COUNT } from "./constants";

// EMP permanently greys out eligible incorrect letters on the virtual keyboard
export const computeEmpCandidates = (
  theSecretWord: TheSecretWord,
  wordleGuesses: ReadonlyArray<TheSecretWord>,
  keypad: Keypad,
  empNukedLetters: ReadonlyArray<string>
) => {
  const empNukedSet = HashSet.fromIterable(empNukedLetters);

  // Computed once: the third filter below runs per keypad letter, and
  // re-evaluating the full board per item is ~30x redundant work
  const keypadState = computeKeypadState(theSecretWord, wordleGuesses);

  return Array.filter(keypad, (letter) => {
    if (theSecretWord.includes(letter) || HashSet.has(empNukedSet, letter)) return false;
    return Option.getOrElse(HashMap.get(keypadState, letter), () => "") === "";
  });
};

// EMP_LETTER_COUNT (currently 3) controls how many letters to nuke per activation
export const calculateEmpTargets = Effect.fnUntraced(function* (
  theSecretWord: TheSecretWord,
  wordleGuesses: ReadonlyArray<TheSecretWord>,
  keypad: Keypad,
  empNukedLetters: ReadonlyArray<string>
) {
  const candidates = computeEmpCandidates(theSecretWord, wordleGuesses, keypad, empNukedLetters);
  if (candidates.length < EMP_LETTER_COUNT) return Option.none();
  const shuffled = yield* Random.shuffle(candidates);
  return Option.some(Array.take(shuffled, EMP_LETTER_COUNT));
});
