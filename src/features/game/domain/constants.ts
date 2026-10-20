// services, features, and other libraries
import { HashSet, Option } from "effect";
import { msg } from "gt-tanstack-start";

// types
import type { Color, GameData, RunSession, WordChallenge, WordMeta } from "./models";

// constants
export const WORD_LENGTH = 5;
export const MAX_TURNS = 6;

// Partial lookups: indexing with a turn past MAX_TURNS or an unknown multiplier yields `undefined`, so callers must handle absence (e.g. `?? 0`)
export const BASE_POINTS_PER_TURN_MAP: Readonly<Partial<Record<number, number>>> = { 1: 1000, 2: 800, 3: 600, 4: 400, 5: 200, 6: 100 };

// Annotated (not cast): Record<Color, number> enforces that every color has a priority and rejects unknown keys
export const COLOR_PRIORITY: Readonly<Record<Color, number>> = { grey: 0, yellow: 1, green: 2, red: 3, "": -1 };

export const SPEED_MULTIPLIER_RULES = [
  { maxSeconds: 30, multiplier: 1.5 },
  { maxSeconds: 60, multiplier: 1.2 },
  { maxSeconds: 180, multiplier: 1.0 },
  { maxSeconds: Infinity, multiplier: 0.8 },
] as const;

export const POTENTIAL_SCORE_RANGE = {
  min: Math.round(
    Math.min(...Object.values(BASE_POINTS_PER_TURN_MAP).filter((points) => points !== undefined)) *
      Math.min(...SPEED_MULTIPLIER_RULES.map(({ multiplier }) => multiplier))
  ),
  max: Math.round(
    Math.max(...Object.values(BASE_POINTS_PER_TURN_MAP).filter((points) => points !== undefined)) *
      Math.max(...SPEED_MULTIPLIER_RULES.map(({ multiplier }) => multiplier))
  ),
} as const;

export const SPEED_MULTIPLIER_CATEGORY_MESSAGE_MAP = {
  "speed-demon": msg("🚀 Speed Demon"),
  "quick-thinker": msg("⚡ Quick Thinker"),
  "average-pacer": msg("⏱️ Average Pacer"),
  "slow-learner": msg("🐌 Slow Learner"),
} as const;

// Stable category identifiers for UI presentation (the message map above is the source of truth)
export type SpeedMultiplierCategory = keyof typeof SPEED_MULTIPLIER_CATEGORY_MESSAGE_MAP;

export const SPEED_MULTIPLIER_CATEGORY_MAP: Readonly<Partial<Record<number, SpeedMultiplierCategory>>> = {
  1.5: "speed-demon",
  1.2: "quick-thinker",
  1.0: "average-pacer",
  0.8: "slow-learner",
};

export const SPEED_MULTIPLIER_CATEGORY_EMOJI_MAP: Readonly<Record<SpeedMultiplierCategory, string>> = {
  "speed-demon": "🚀",
  "quick-thinker": "⚡",
  "average-pacer": "⏱️",
  "slow-learner": "🐌",
};

export const INITIAL_GAME_DATA = {
  solutions: Option.none(),
  dictionary: Option.none(),
  keypad: Option.none(),
} as const satisfies GameData;

export const INITIAL_WORD_META = {
  theRiddle: Option.none(),
  wordDefinition: Option.none(),
  theRiddleAudio: Option.none(),
  wordDefinitionAudio: Option.none(),
} as const satisfies WordMeta;

export const INITIAL_WORD_CHALLENGE = {
  dictionary: Option.none(),
  theSecretWord: Option.none(),
  currentGuessWord: "",
  wordleGuesses: [],
  currentTurn: 1,
  startTime: Option.none(),
  wordScore: Option.none(),
  greyLetters: HashSet.empty<string>(),
} as const satisfies WordChallenge;

export const INITIAL_RUN_SESSION = {
  runId: Option.none(),
  createdAt: Option.none(),
  runScore: 0,
  streak: 0,
  bestRunScore: 0,
  bestStreak: 0,
} as const satisfies RunSession;
