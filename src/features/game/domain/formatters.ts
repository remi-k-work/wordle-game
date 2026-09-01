// services, features, and other libraries
import { Array, HashMap, Option } from "effect";

// types
import type { TheSecretWord, Tile, WordChallenge } from ".";

// constants
import { SPEED_MULTIPLIER_CATEGORY_MAP } from ".";

// Maps a speed multiplier to a stable category identifier for UI presentation.
export const speedMultiplierToCategory = (speedMultiplier: number) => SPEED_MULTIPLIER_CATEGORY_MAP[speedMultiplier];

// Format the current guess word into an array of letter objects with color coding
export const formatGuess = (theSecretWord: TheSecretWord, wordleGuess: WordChallenge["wordleGuesses"][number]): Tile[] => {
  const secretChars = Array.fromIterable(theSecretWord);
  const guessChars = Array.fromIterable(wordleGuess);

  // Build count pool of remaining characters available for yellow matches
  const pool = Array.reduce(secretChars, HashMap.empty<string, number>(), (acc, char, i) =>
    char !== guessChars[i] ? HashMap.set(acc, char, Option.getOrElse(HashMap.get(acc, char), () => 0) + 1) : acc
  );

  // Map characters directly to their correct colors, threading the pool through each step
  return Array.mapAccum(guessChars, pool, (pool, char, i): [HashMap.HashMap<string, number>, Tile] => {
    if (char === secretChars[i]) return [pool, { tileKey: char, color: "green" }];
    const count = Option.getOrElse(HashMap.get(pool, char), () => 0);
    if (count > 0) return [HashMap.set(pool, char, count - 1), { tileKey: char, color: "yellow" }];
    return [pool, { tileKey: char, color: "grey" }];
  })[1];
};
