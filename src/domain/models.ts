// services, features, and other libraries
import { Data, DateTime, Option } from "effect";

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
  riddle: string;
  currentGuessWord: string;
  wordleGuesses: ReadonlyArray<string>;
  currentTurn: number;
  isInvalidGuess: boolean;
  startTime: Option.Option<DateTime.Utc>;
  wordScore: Option.Option<WordScore>;
}>;

export type Language = "En" | "Pl";
export type Color = "grey" | "yellow" | "green" | "red" | "";
export type Tile = Readonly<{ tileKey: string; color: Color }>;
export type WordleGrid = ReadonlyArray<ReadonlyArray<Tile>>;
export type GameAction = Data.TaggedEnum<{ AddLetter: { readonly letter: string }; RemoveLetter: object; SubmitGuess: object; Ignore: object }>;
export type GameStatus = Data.TaggedEnum<{ Playing: object; Won: object; Lost: object }>;

// constants
export const GameActionEnum = Data.taggedEnum<GameAction>();
export const GameStatusEnum = Data.taggedEnum<GameStatus>();

export const INITIAL_GAME_STATE = {
  theSecretWord: "",
  riddle: "",
  currentGuessWord: "",
  wordleGuesses: [],
  currentTurn: 1,
  isInvalidGuess: false,
  startTime: Option.none(),
  wordScore: Option.none(),
} as const satisfies GameState;
