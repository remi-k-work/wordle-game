// services, features, and other libraries
import { Array, Duration, Option, pipe } from "effect";

// types
import type { Color, Language, Tile } from ".";

// constants
import { SPEED_MULTIPLIER_CATEGORY_MAP_EN, SPEED_MULTIPLIER_CATEGORY_MAP_PL } from ".";

// Maps a speed multiplier to a category of a player (e.g. "Speed Demon")
export const speedMultiplierToCategory = (language: Language, speedMultiplier: number) =>
  language === "En" ? SPEED_MULTIPLIER_CATEGORY_MAP_EN[speedMultiplier] : SPEED_MULTIPLIER_CATEGORY_MAP_PL[speedMultiplier];

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

  // Identify letters that are not perfect "green" matches to form our remaining pool
  const initialPool = Array.filter(secretChars, (char, i) => char !== guessChars[i]);

  // Reduce to final tiles, functionally removing used letters from the pool for "yellows"
  return Array.reduce(guessChars, { pool: initialPool, tiles: [] as Tile[] }, (acc, guessChar, i) => {
    if (guessChar === secretChars[i]) {
      return { ...acc, tiles: Array.append(acc.tiles, { tileKey: guessChar, color: "green" as Color }) };
    }

    const poolIndex = Array.findFirstIndex(acc.pool, (c) => c === guessChar);

    return Option.match(poolIndex, {
      onNone: () => ({ ...acc, tiles: Array.append(acc.tiles, { tileKey: guessChar, color: "grey" as Color }) }),
      onSome: (idx) => ({
        pool: Array.remove(acc.pool, idx),
        tiles: Array.append(acc.tiles, { tileKey: guessChar, color: "yellow" as Color }),
      }),
    });
  }).tiles;
};

// Derive the full 6x5 grid state for rendering based on completed guesses
export const deriveWordleGrid = (theSecretWord: string, wordleGuesses: readonly string[]) =>
  Array.makeBy(6, (rowIndex) =>
    pipe(
      Array.get(wordleGuesses, rowIndex),
      Option.match({
        onNone: () => Array.makeBy(5, () => ({ tileKey: "", color: "" as Color })),
        onSome: (guess) => formatGuess(theSecretWord, guess),
      })
    )
  );
