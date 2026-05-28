// services, features, and other libraries
import { Array, Duration, Option, pipe } from "effect";

// types
import type { Color, Tile } from ".";

// constants
import { MAX_TURNS, SPEED_MULTIPLIER_CATEGORY_MAP, WORD_LENGTH } from ".";

// Maps a speed multiplier to a category of a player (e.g. "Speed Demon")
export const speedMultiplierToCategory = (speedMultiplier: number) => SPEED_MULTIPLIER_CATEGORY_MAP[speedMultiplier];

// Formats an Effect Duration into a human-readable HH:mm:ss string
export const formatDuration = (duration: Duration.Duration) => {
  const { hours, minutes, seconds } = Duration.parts(duration);
  const pad = (n: number) => n.toString().padStart(2, "0");

  return hours > 0 ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
};

// Format the current guess word into an array of letter objects with color coding
export const formatGuess = (theSecretWord: string, wordleGuess: string) => {
  const secretChars = [...theSecretWord];
  const guessChars = [...wordleGuess];

  // Build count pool of remaining characters available for yellow matches
  const pool: Record<string, number> = {};
  for (let i = 0; i < secretChars.length; i++) if (secretChars[i] !== guessChars[i]) pool[secretChars[i]] = (pool[secretChars[i]] || 0) + 1;

  // Map characters directly to their correct colors without modifying arrays
  return guessChars.map((char, i): Tile => {
    if (char === secretChars[i]) return { tileKey: char, color: "green" };
    if (pool[char] > 0) {
      pool[char]--;
      return { tileKey: char, color: "yellow" };
    }
    return { tileKey: char, color: "grey" };
  });
};

// Derive the full 6x5 grid state for rendering based on completed guesses
export const deriveWordleGrid = (theSecretWord: string, wordleGuesses: readonly string[]) =>
  Array.makeBy(MAX_TURNS, (rowIndex) =>
    pipe(
      Array.get(wordleGuesses, rowIndex),
      Option.match({
        onNone: () => Array.makeBy(WORD_LENGTH, () => ({ tileKey: "", color: "" as Color })),
        onSome: (guess) => formatGuess(theSecretWord, guess),
      })
    )
  );
