// services, features, and other libraries
import { Effect, Array, HashMap, HashSet, Option, Random, Result } from "effect";
import { computeKeypadState } from "@/features/game/domain/game-logic";

// types
import type { TheSecretWord } from "@/features/game/domain/models";
import type { SonarReveal } from "./models";

// Randomly reveals one previously unknown vowel and all of its positions in the secret word
export const computeSonarCandidates = (
  theSecretWord: TheSecretWord,
  wordleGuesses: ReadonlyArray<TheSecretWord>,
  vowels: ReadonlyArray<SonarReveal["vowel"]>,
  alreadyRevealedLetters: ReadonlyArray<SonarReveal["vowel"]>
) => {
  const alreadyRevealedSet = HashSet.fromIterable(alreadyRevealedLetters);

  // Computed once: the third filter below runs per vowel, and re-evaluating the
  // full board (formatGuess x guesses + reduce) per item is ~30x redundant work
  const keypadState = computeKeypadState(theSecretWord, wordleGuesses);

  return Array.filter(vowels, (vowel) => {
    if (!theSecretWord.includes(vowel) || HashSet.has(alreadyRevealedSet, vowel)) {
      return false;
    }
    const color = Option.getOrElse(HashMap.get(keypadState, vowel), () => "");
    return color === "" || color === "grey";
  });
};

export const calculateSonarTarget = Effect.fnUntraced(function* (
  theSecretWord: TheSecretWord,
  wordleGuesses: ReadonlyArray<TheSecretWord>,
  vowels: ReadonlyArray<SonarReveal["vowel"]>,
  alreadyRevealedVowels: ReadonlyArray<SonarReveal["vowel"]>
) {
  const candidates = computeSonarCandidates(theSecretWord, wordleGuesses, vowels, alreadyRevealedVowels);
  if (!Array.isReadonlyArrayNonEmpty(candidates)) return Option.none();

  // Pick exactly one vowel at random from the equally-valid candidates
  const vowel = yield* Random.choice(candidates);

  return Option.some({
    vowel,
    // A vowel may appear at multiple positions in the secret word (e.g. both E's in "SPEED")
    positions: Array.filterMap(theSecretWord, (letter, index) => (letter === vowel ? Result.succeed(index) : Result.failVoid)),
  });
});

// O(1) tile lookup: flatten reveal positions once instead of scanning per tile
export const sonarVowelByPosition = (reveals: ReadonlyArray<SonarReveal>): Map<number, SonarReveal["vowel"]> =>
  new Map(reveals.flatMap((reveal) => reveal.positions.map((position) => [position, reveal.vowel] as const)));
