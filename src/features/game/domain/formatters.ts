// services, features, and other libraries
import { Array, HashMap, Option } from "effect";
import { msg } from "gt-react";

// types
import type { TheSecretWord, Tile } from "./models";
import type { WordChallenge } from "@/features/game/machines/word-challenge/models";
import type { SpeedMultiplierCategory } from "./constants";

// constants
import { SPEED_MULTIPLIER_CATEGORY_EMOJI_MAP, SPEED_MULTIPLIER_CATEGORY_MESSAGE_MAP, SPEED_MULTIPLIER_RULES } from "./constants";

const speedMultiplierRule = (speedMultiplier: number) => Array.findFirst(SPEED_MULTIPLIER_RULES, (rule) => rule.multiplier === speedMultiplier);

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

// Maps a speed multiplier to a category-keyed presentation value, falling back
// when the multiplier is unknown. One helper serves both the message and the
// emoji map: the fallback stays a thunk so `msg("Unknown")` is only resolved
// on an actual miss, not at module scope
const categoryLookup =
  <A>(map: Readonly<Record<SpeedMultiplierCategory, A>>, fallback: () => A) =>
  (speedMultiplier: number) =>
    speedMultiplierRule(speedMultiplier).pipe(
      Option.map((rule) => map[rule.category]),
      Option.getOrElse(fallback)
    );

export const speedMultiplierToCategoryMessage = categoryLookup(SPEED_MULTIPLIER_CATEGORY_MESSAGE_MAP, () => msg("Unknown"));
export const speedMultiplierToCategoryEmoji = categoryLookup(SPEED_MULTIPLIER_CATEGORY_EMOJI_MAP, () => "?");

export const maxSecondsToSpeedMultiplier = (maxSeconds: number | null) =>
  Array.findFirst(SPEED_MULTIPLIER_RULES, (rule) => rule.maxSeconds === maxSeconds).pipe(Option.map((rule) => rule.multiplier));
