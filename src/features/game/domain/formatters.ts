// services, features, and other libraries
import { Array, HashMap, Option } from "effect";
import { msg } from "gt-react";

// types
import type { TheSecretWord, Tile, WordChallenge } from "./models";

// constants
import { SPEED_MULTIPLIER_CATEGORY_EMOJI_MAP, SPEED_MULTIPLIER_CATEGORY_MESSAGE_MAP, SPEED_MULTIPLIER_RULES } from "./constants";

const speedMultiplierRule = (speedMultiplier: number) => Array.findFirst(SPEED_MULTIPLIER_RULES, (rule) => rule.multiplier === speedMultiplier);

// Maps a speed multiplier to a stable category identifier for UI presentation
export const speedMultiplierToCategory = (speedMultiplier: number) =>
  speedMultiplierRule(speedMultiplier).pipe(
    Option.map((rule) => rule.category),
    Option.getOrUndefined
  );

// Format the current guess word into an array of letter objects with color coding
export const formatGuess = (theSecretWord: TheSecretWord, wordleGuess: WordChallenge["wordleGuesses"][number]): Tile[] => {
  const secretChars = Array.fromIterable(theSecretWord);
  const guessChars = Array.fromIterable(wordleGuess);

  // Build count pool of remaining characters available for yellow matches
  const pool = Array.reduce(secretChars, HashMap.empty<string, number>(), (acc, char, i) =>
    char !== guessChars[i] ? HashMap.set(acc, char, Option.getOrElse(HashMap.get(acc, char), () => 0) + 1) : acc
  );

  // Map characters directly to their correct colors, threading the pool through each step
  const [, tiles] = Array.mapAccum(guessChars, pool, (pool, char, i): [HashMap.HashMap<string, number>, Tile] => {
    if (char === secretChars[i]) return [pool, { tileKey: char, color: "green" }];
    const count = Option.getOrElse(HashMap.get(pool, char), () => 0);
    if (count > 0) return [HashMap.set(pool, char, count - 1), { tileKey: char, color: "yellow" }];
    return [pool, { tileKey: char, color: "grey" }];
  });

  return tiles;
};

export const speedMultiplierToCategoryMessage = (speedMultiplier: number) =>
  speedMultiplierRule(speedMultiplier).pipe(
    Option.map((rule) => SPEED_MULTIPLIER_CATEGORY_MESSAGE_MAP[rule.category]),
    Option.getOrElse(() => msg("Unknown"))
  );

export const speedMultiplierToCategoryEmoji = (speedMultiplier: number) =>
  speedMultiplierRule(speedMultiplier).pipe(
    Option.map((rule) => SPEED_MULTIPLIER_CATEGORY_EMOJI_MAP[rule.category]),
    Option.getOrElse(() => "?")
  );

export const maxSecondsToSpeedMultiplier = (maxSeconds: number | null) =>
  Array.findFirst(SPEED_MULTIPLIER_RULES, (rule) => rule.maxSeconds === maxSeconds).pipe(Option.map((rule) => rule.multiplier));
