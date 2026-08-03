// services, features, and other libraries
import { Effect, Array, Option, Random, pipe } from "effect";
import { computeKeypadState } from "@/features/game/domain";

// types
import type { TheSecretWord } from "@/features/game/domain";
import type { SonarReveal } from ".";

export const computeSonarCandidates = (
  theSecretWord: TheSecretWord,
  wordleGuesses: ReadonlyArray<TheSecretWord>,
  vowels: ReadonlyArray<SonarReveal["vowel"]>,
  alreadyRevealedLetters: ReadonlyArray<SonarReveal["vowel"]>
) =>
  pipe(
    vowels,
    Array.filter((vowel) => theSecretWord.includes(vowel)),
    Array.filter((vowel) => !alreadyRevealedLetters.includes(vowel)),
    Array.filter((vowel) => {
      const color = computeKeypadState(theSecretWord, wordleGuesses)[vowel];
      return color === undefined || color === "" || color === "grey";
    })
  );

export const calculateSonarTarget = (
  theSecretWord: TheSecretWord,
  wordleGuesses: ReadonlyArray<TheSecretWord>,
  vowels: ReadonlyArray<SonarReveal["vowel"]>,
  alreadyRevealedVowels: ReadonlyArray<SonarReveal["vowel"]>
) =>
  Effect.gen(function* () {
    const candidates = computeSonarCandidates(theSecretWord, wordleGuesses, vowels, alreadyRevealedVowels);
    if (candidates.length === 0) return Option.none();

    const [vowel] = Array.take(1)(yield* Random.shuffle(candidates));
    if (vowel === undefined) return Option.none();

    return Option.some({
      vowel,
      positions: pipe(
        Array.makeBy(theSecretWord.length, (index) => (theSecretWord[index] === vowel ? index : -1)),
        Array.filter((index) => index >= 0)
      ),
    });
  });
