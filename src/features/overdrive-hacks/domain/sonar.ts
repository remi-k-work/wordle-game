// services, features, and other libraries
import { Effect, Array, HashMap, HashSet, Option, Random, pipe } from "effect";
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
) => {
  const alreadyRevealedSet = HashSet.fromIterable(alreadyRevealedLetters);

  return pipe(
    vowels,
    // Keep only vowels that actually appear somewhere in the secret word
    Array.filter((vowel) => theSecretWord.includes(vowel)),
    // Exclude vowels already revealed by previous sonar activations
    Array.filter((vowel) => !HashSet.has(alreadyRevealedSet, vowel)),
    // Keep vowels the player hasn't positively identified yet (untouched or only greyed-out guesses)
    Array.filter((vowel) =>
      Option.match(HashMap.get(computeKeypadState(theSecretWord, wordleGuesses), vowel), {
        onNone: () => true,
        onSome: (color) => color === "" || color === "grey",
      })
    )
  );
};

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
    const shuffled = yield* Random.shuffle(candidates);
    const vowelOpt = Array.head(shuffled);

    return Option.match(vowelOpt, {
      onNone: () => Option.none(),
      onSome: (vowel) =>
        Option.some({
          vowel,
          // A vowel may appear at multiple positions in the secret word (e.g. both E's in "SPEED")
          positions: pipe(
            Array.makeBy(theSecretWord.length, (index) => (theSecretWord[index] === vowel ? index : -1)),
            Array.filter((index) => index >= 0)
          ),
        }),
    });
  });
