// services, features, and other libraries
import { Option } from "effect";
import { msg } from "gt-next";

// types
import type { Color, GameData, RunSession, WordChallenge, WordMeta } from ".";

// constants
export const WORD_LENGTH = 5;
export const MAX_TURNS = 6;

export const BASE_POINTS_PER_TURN_MAP = { 1: 1000, 2: 800, 3: 600, 4: 400, 5: 200, 6: 100 } as const as Readonly<Record<number, number>>;
export const COLOR_PRIORITY = { grey: 0, yellow: 1, green: 2, red: 3, "": -1 } as const as Record<Color, number>;

export const SPEED_MULTIPLIER_RULES = [
  { maxSeconds: 30, multiplier: 1.5 },
  { maxSeconds: 60, multiplier: 1.2 },
  { maxSeconds: 180, multiplier: 1.0 },
  { maxSeconds: Infinity, multiplier: 0.8 },
] as const;

export const POTENTIAL_SCORE_RANGE = {
  min: Math.round(Math.min(...Object.values(BASE_POINTS_PER_TURN_MAP)) * Math.min(...SPEED_MULTIPLIER_RULES.map(({ multiplier }) => multiplier))),
  max: Math.round(Math.max(...Object.values(BASE_POINTS_PER_TURN_MAP)) * Math.max(...SPEED_MULTIPLIER_RULES.map(({ multiplier }) => multiplier))),
} as const;

export const SPEED_MULTIPLIER_CATEGORY_MAP = {
  1.5: "speed-demon",
  1.2: "quick-thinker",
  1.0: "average-pacer",
  0.8: "slow-learner",
} as const as Readonly<Record<number, string>>;

export const SPEED_MULTIPLIER_CATEGORY_MESSAGE_MAP = {
  "speed-demon": msg("🚀 Speed Demon"),
  "quick-thinker": msg("⚡ Quick Thinker"),
  "average-pacer": msg("⏱️ Average Pacer"),
  "slow-learner": msg("🐌 Slow Learner"),
} as const;

export const SPEED_MULTIPLIER_CATEGORY_EMOJI_MAP = {
  "speed-demon": "🚀",
  "quick-thinker": "⚡",
  "average-pacer": "⏱️",
  "slow-learner": "🐌",
} as const;

export const INITIAL_GAME_DATA = {
  solutions: Option.none(),
  dictionary: Option.none(),
  keypad: Option.none(),
} as const satisfies GameData;

export const INITIAL_WORD_META = {
  theRiddle: Option.none(),
  wordDefinition: Option.none(),
} as const satisfies WordMeta;

export const INITIAL_WORD_CHALLENGE = {
  dictionary: Option.none(),
  theSecretWord: Option.none(),
  currentGuessWord: "",
  wordleGuesses: [],
  currentTurn: 1,
  startTime: Option.none(),
  wordScore: Option.none(),
} as const satisfies WordChallenge;

export const INITIAL_RUN_SESSION = {
  runId: Option.none(),
  createdAt: Option.none(),
  runScore: 0,
  streak: 0,
  bestRunScore: 0,
  bestStreak: 0,
} as const satisfies RunSession;
