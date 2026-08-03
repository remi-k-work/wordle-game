// services, features, and other libraries
import { Option } from "effect";

// types
import type { Color, GameData, OverdriveHacks, RunSession, SolutionsLanguage, WordChallenge, WordMeta } from ".";

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
  1.5: "🚀 Speed Demon",
  1.2: "⚡ Quick Thinker",
  1.0: "⏱️ Average Pacer",
  0.8: "🐌 Slow Learner",
} as const as Readonly<Record<number, string>>;

// EMP lifeline (to instantly mark incorrect letters as grey on the keypad)
export const EMP_COST = 1500;
export const EMP_LETTER_COUNT = 3;

// Sonar lifeline (reveal one vowel and its positions in the secret word)
export const SONAR_COST = 2000;

// Language-aware vowel sets for the Sonar lifeline
export const VOWELS_BY_LANGUAGE = {
  En: ["A", "E", "I", "O", "U"],
  Pl: ["A", "Ą", "E", "Ę", "I", "O", "Ó", "U", "Y"],
} as const satisfies Readonly<Record<SolutionsLanguage, readonly string[]>>;

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
  empNukedLetters: [],
  sonarRevealedLetters: [],
} as const satisfies WordChallenge;

export const INITIAL_OVERDRIVE_HACKS = {
  theSecretWord: Option.none(),
  keypad: Option.none(),
} as const satisfies OverdriveHacks;

export const INITIAL_RUN_SESSION = {
  runId: Option.none(),
  createdAt: Option.none(),
  runScore: 0,
  streak: 0,
  bestRunScore: 0,
  bestStreak: 0,
} as const satisfies RunSession;
