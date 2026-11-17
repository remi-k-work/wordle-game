// services, features, and other libraries
import { HashSet, Option, Record } from "effect";
import { msg } from "gt-react";

// types
import type { Color, Letter, SolutionsLanguage, WordChallenge, WordMeta } from "./models";

// Stable category identifiers for UI presentation (the message map above is the source of truth)
export type SpeedMultiplierCategory = keyof typeof SPEED_MULTIPLIER_CATEGORY_MESSAGE_MAP;

// constants
export const WORD_LENGTH = 5;
export const MAX_TURNS = 6;

// The board's "no letter in this position" tile key. Not a valid `Letter` (that
// schema requires one character), so it exists purely as the rendering sentinel
// for an empty tile — shared by the grid factory, the typing row and the
// sonar-grid projection so the sentinel is not re-invented per file
export const EMPTY_TILE_KEY = "";

// Skeleton keypad letters per language, mirroring the keypad build assets
// (src/assets/data/keypad-{en,pl}.json) that the live pool renders once the RPC
// has loaded them. The placeholder must show the same keys — Polish has 32,
// including the diacritics and no Q/V/X — or the loading pool visibly changes
// size when the real one arrives
export const KEYPAD_SKELETON_LETTERS = {
  En: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
  Pl: [
    "A",
    "Ą",
    "B",
    "C",
    "Ć",
    "D",
    "E",
    "Ę",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "Ł",
    "M",
    "N",
    "Ń",
    "O",
    "Ó",
    "P",
    "R",
    "S",
    "Ś",
    "T",
    "U",
    "W",
    "Y",
    "Z",
    "Ź",
    "Ż",
  ],
} as const satisfies Record.ReadonlyRecord<SolutionsLanguage, ReadonlyArray<string>>;

// Partial lookups: indexing with a turn past MAX_TURNS or an unknown multiplier yields `undefined`, so callers must handle absence (e.g. `?? 0`)
export const BASE_POINTS_PER_TURN_MAP: Readonly<{ [index: number]: number }> = { 1: 1000, 2: 800, 3: 600, 4: 400, 5: 200, 6: 100 };

// Annotated (not cast): Record<Color, number> enforces that every color has a priority and rejects unknown keys
export const COLOR_PRIORITY = { grey: 0, yellow: 1, green: 2, red: 3, "": -1 } as const satisfies Record.ReadonlyRecord<Color, number>;

export const SPEED_MULTIPLIER_CATEGORY_MESSAGE_MAP = {
  "speed-demon": msg("🚀 Speed Demon"),
  "quick-thinker": msg("⚡ Quick Thinker"),
  "average-pacer": msg("⏱️ Average Pacer"),
  "slow-learner": msg("🐌 Slow Learner"),
} as const;

// Each rule owns both its multiplier and its presentation category, so the two cannot drift apart
export const SPEED_MULTIPLIER_RULES = [
  { maxSeconds: 30, multiplier: 1.5, category: "speed-demon" },
  { maxSeconds: 60, multiplier: 1.2, category: "quick-thinker" },
  { maxSeconds: 180, multiplier: 1.0, category: "average-pacer" },
  { maxSeconds: Infinity, multiplier: 0.8, category: "slow-learner" },
] as const satisfies ReadonlyArray<{ readonly maxSeconds: number; readonly multiplier: number; readonly category: SpeedMultiplierCategory }>;

export const SPEED_MULTIPLIER_CATEGORY_EMOJI_MAP = {
  "speed-demon": "🚀",
  "quick-thinker": "⚡",
  "average-pacer": "⏱️",
  "slow-learner": "🐌",
} as const satisfies Record.ReadonlyRecord<SpeedMultiplierCategory, string>;

// Object.values on the numeric index-signature map is already number[] (no
// noUncheckedIndexedAccess), so neither a `!== undefined` guard nor the guard's
// two extra copies is needed — derive the two arrays once and take both extremes
const BASE_POINTS_PER_TURN = Object.values(BASE_POINTS_PER_TURN_MAP);
const SPEED_MULTIPLIERS = SPEED_MULTIPLIER_RULES.map(({ multiplier }) => multiplier);

export const POTENTIAL_SCORE_RANGE = {
  min: Math.round(Math.min(...BASE_POINTS_PER_TURN) * Math.min(...SPEED_MULTIPLIERS)),
  max: Math.round(Math.max(...BASE_POINTS_PER_TURN) * Math.max(...SPEED_MULTIPLIERS)),
} as const;

// A factory rather than a shared constant: the machine's `clearWordMeta` action
// returns it directly, so a constant would alias a module global into every live
// context — the same reasoning as `initialWordChallenge`/`initialOverdriveHacks`
export const initialWordMeta = () =>
  ({
    theRiddle: Option.none(),
    wordDefinition: Option.none(),
    theRiddleAudio: Option.none(),
    wordDefinitionAudio: Option.none(),
  }) as const satisfies WordMeta;

export const initialWordChallenge = () =>
  ({
    dictionary: Option.none(),
    theSecretWord: Option.none(),
    currentGuessWord: "",
    wordleGuesses: [],
    currentTurn: 1,
    startTime: Option.none(),
    wordScore: Option.none(),
    greyLetters: HashSet.empty<Letter>(),
  }) as const satisfies WordChallenge;
