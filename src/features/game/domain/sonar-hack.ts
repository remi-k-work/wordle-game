// services, features, and other libraries
import { Effect, Array, Option, Random, pipe } from "effect";
import { computeKeypadState } from ".";

// types
import type { SonarReveal, TheSecretWord, WordChallenge } from ".";

// Pure synchronous helper that computes the list of vowels that are still safe Sonar
// targets. "Safe" means: present in the secret word, in the language-aware vowel set,
// not already revealed by a prior Sonar pick this word, AND not already "found" by the
// player via real guesses (green OR yellow in computeKeypadState both count as "found"
// and are excluded — only undefined / "" / "grey" remain candidates).
//
// Shared by both the overdriveHacks `canUseLifeline("sonar")` guard (which needs the
// count) and `calculateSonarTarget` (which then picks one randomly), so the filter
// logic lives in exactly one place — mirrors the `computeEmpCandidates` pattern.
export const computeSonarCandidates = (
  theSecretWord: TheSecretWord,
  wordleGuesses: WordChallenge["wordleGuesses"],
  vowels: ReadonlyArray<SonarReveal["vowel"]>,
  alreadyRevealedLetters: ReadonlyArray<SonarReveal["vowel"]>
) =>
  pipe(
    vowels,
    Array.filter((vowel) => theSecretWord.includes(vowel)),
    Array.filter((vowel) => !alreadyRevealedLetters.includes(vowel)),
    Array.filter((vowel) => {
      const color = computeKeypadState(theSecretWord, wordleGuesses)[vowel];
      // "found" by the player via guessing = green OR yellow. Exclude those — only undefined / "" / "grey"
      // (i.e. never-guessed, or guessed & ruled-out — latter can't happen for an in-word vowel but be safe).
      // Explicit type check avoids TS truthiness-narrowing that would reject the `=== ""` branch.
      return color === undefined || color === "" || color === "grey";
    })
  );

// Pure Effect pipeline: pick ONE random vowel from the candidate pool, then return the
// vowel plus ALL indices in `theSecretWord` where it appears.
//
// Returns `Effect<Option<{vowel, positions}>>` — `Option.none()` if the pool is empty.
// Self-contained: the sync `length === 0` short-circuit guards it from ever destructuring
// `undefined`. The `overdriveHacksMachine` applyLifeline action calls this behind a sync
// pre-check for cheap short-circuit, and an `Option.isNone` post-check for safety.
export const calculateSonarTarget = (
  theSecretWord: TheSecretWord,
  wordleGuesses: WordChallenge["wordleGuesses"],
  vowels: ReadonlyArray<SonarReveal["vowel"]>,
  alreadyRevealedLetters: ReadonlyArray<SonarReveal["vowel"]>
) =>
  Effect.gen(function* () {
    const candidates = computeSonarCandidates(theSecretWord, wordleGuesses, vowels, alreadyRevealedLetters);
    if (candidates.length === 0) return Option.none();

    const shuffled = yield* Random.shuffle(candidates);
    const taken = Array.take(1)(shuffled);
    if (taken.length === 0) return Option.none();
    const vowel = taken[0];

    return Option.some({
      vowel,
      positions: pipe(
        Array.makeBy(theSecretWord.length, (i) => (theSecretWord[i] === vowel ? i : -1)),
        Array.filter((i) => i >= 0)
      ),
    });
  });
