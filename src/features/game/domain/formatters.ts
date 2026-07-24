// services, features, and other libraries
import { Duration } from "effect";

// types
import type { Tile } from ".";

// constants
import { SPEED_MULTIPLIER_CATEGORY_MAP } from ".";

// Maps a speed multiplier to a category of a player (e.g. "Speed Demon")
export const speedMultiplierToCategory = (speedMultiplier: number) => SPEED_MULTIPLIER_CATEGORY_MAP[speedMultiplier];

// Formats an Effect Duration into a human-readable HH:mm:ss string (also considers days)
export const formatDuration = (duration: Duration.Duration) => {
  const { days, hours, minutes, seconds } = Duration.parts(duration);
  const pad = (n: number) => n.toString().padStart(2, "0");

  if (days > 0) return `${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  if (hours > 0) return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  return `${pad(minutes)}:${pad(seconds)}`;
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
