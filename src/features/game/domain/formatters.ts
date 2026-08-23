// types
import type { TheSecretWord, Tile, WordChallenge } from ".";

// constants
import { SPEED_MULTIPLIER_CATEGORY_MAP } from ".";

// Maps a speed multiplier to a stable category identifier for UI presentation.
export const speedMultiplierToCategory = (speedMultiplier: number) => SPEED_MULTIPLIER_CATEGORY_MAP[speedMultiplier];

// Format the current guess word into an array of letter objects with color coding
export const formatGuess = (theSecretWord: TheSecretWord, wordleGuess: WordChallenge["wordleGuesses"][number]) => {
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
