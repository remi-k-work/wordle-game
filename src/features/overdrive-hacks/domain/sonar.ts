// services, features, and other libraries
import { Effect, Array, Option, Random, pipe } from "effect";
import { computeKeypadState } from "@/features/game/domain";

// types
import type { TheSecretWord } from "@/features/game/domain";
import type { SonarReveal } from ".";

// Randomly reveals one previously unknown vowel and all of its positions in the secret word
export const computeSonarCandidates = (
  theSecretWord: TheSecretWord,
  wordleGuesses: ReadonlyArray<TheSecretWord>,
  vowels: ReadonlyArray<SonarReveal["vowel"]>,
  alreadyRevealedLetters: ReadonlyArray<SonarReveal["vowel"]>
) =>
  pipe(
    vowels,
    // Keep only vowels that actually appear somewhere in the secret word
    Array.filter((vowel) => theSecretWord.includes(vowel)),
    // Exclude vowels already revealed by previous sonar activations
    Array.filter((vowel) => !alreadyRevealedLetters.includes(vowel)),
    // Keep vowels the player hasn't positively identified yet (untouched or only greyed-out guesses)
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

    // Shuffle then pick exactly one vowel at random from equally-valid candidates
    const [vowel] = Array.take(1)(yield* Random.shuffle(candidates));
    if (vowel === undefined) return Option.none();

    return Option.some({
      vowel,
      // A vowel may appear at multiple positions in the secret word (e.g. both E's in "SPEED")
      positions: pipe(
        Array.makeBy(theSecretWord.length, (index) => (theSecretWord[index] === vowel ? index : -1)),
        Array.filter((index) => index >= 0)
      ),
    });
  });
