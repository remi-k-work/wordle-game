// services, features, and other libraries
import { Data, DateTime, Option, Schema } from "effect";

// schemas
export const SolutionsDataSchema = Schema.Array(Schema.Trim);
export const KeypadDataSchema = Schema.Array(Schema.Trim);

// types
// Represents the results of a single word challenge (specifically denotes the volatile points earned for solving a specific word)
export type WordScore = Readonly<{
  wordScore: number;
  basePointsPerTurn: number;
  speedMultiplier: number;
  timeSeconds: number;
}>;

// Represents the state of the current arcade run (points from individual words accumulate here into a persistent total until a loss occurs)
export type RunSession = Readonly<{
  runScore: number;
  streak: number;
  lastRunScore: number;
  lastRunStreak: number;
  bestRunScore: number;
}>;

export type GameState = Readonly<{
  theSecretWord: string;
  currentGuessWord: string;
  wordleGuesses: Readonly<string[]>;
  currentTurn: number;
  isInvalidGuess: boolean;
  startTime: Option.Option<DateTime.Utc>;
  wordScore: Option.Option<WordScore>;
}>;

export type Language = "En" | "Pl";
export type Color = "grey" | "yellow" | "green" | "red" | "";
export type Tile = Readonly<{ tileKey: string; color: Color }>;
export type WordleGrid = Readonly<Tile[][]>;
export type GameAction = Data.TaggedEnum<{ AddLetter: { readonly letter: string }; RemoveLetter: object; SubmitGuess: object; Ignore: object }>;
export type GameStatus = Data.TaggedEnum<{ Playing: object; Won: object; Lost: object }>;

// constants
export const GameActionEnum = Data.taggedEnum<GameAction>();
export const GameStatusEnum = Data.taggedEnum<GameStatus>();

export const WORD_LENGTH = 5;
export const MAX_TURNS = 6;

export const INITIAL_GAME_STATE = {
  theSecretWord: "",
  currentGuessWord: "",
  wordleGuesses: [],
  currentTurn: 1,
  isInvalidGuess: false,
  startTime: Option.none(),
  wordScore: Option.none(),
} as const satisfies GameState;

export const BASE_POINTS_PER_TURN_MAP = { 1: 1000, 2: 800, 3: 600, 4: 400, 5: 200, 6: 100 } as const as Readonly<Record<number, number>>;

export const SPEED_MULTIPLIER_RULES = [
  { maxSeconds: 30, multiplier: 1.5 },
  { maxSeconds: 60, multiplier: 1.2 },
  { maxSeconds: 180, multiplier: 1.0 },
  { maxSeconds: Infinity, multiplier: 0.8 },
] as const;

export const SPEED_MULTIPLIER_CATEGORY_MAP_EN = {
  1.5: "Speed Demon",
  1.2: "Quick Thinker",
  1.0: "Average Pacer",
  0.8: "Slow Learner",
} as const as Readonly<Record<number, string>>;
export const SPEED_MULTIPLIER_CATEGORY_MAP_PL = {
  1.5: "Demon Szybkości",
  1.2: "Szybki Myśliciel",
  1.0: "Przeciętny Pacer",
  0.8: "Powolny Uczeń",
} as const as Readonly<Record<number, string>>;
