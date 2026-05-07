// services, features, and other libraries
import { Data, Schema } from "effect";

// schemas
export const SolutionsDataSchema = Schema.Array(Schema.Trim);
export const KeypadDataSchema = Schema.Array(Schema.Trim);
export const GameStatusEnum = Data.taggedEnum<GameStatus>();

// types
export type GameState = Readonly<{
  theSecretWord: string;
  currentGuessWord: string;
  wordleGuesses: Readonly<string[]>;
  currentTurn: number;
  isInvalidGuess: boolean;
}>;

export type Language = "En" | "Pl";
export type Color = "grey" | "yellow" | "green" | "red" | "";
export type Tile = Readonly<{ tileKey: string; color: Color }>;
export type WordleGrid = Readonly<Tile[][]>;
export type GameStatus = Data.TaggedEnum<{ Playing: object; Won: object; Lost: object }>;

// constants
export const INITIAL_GAME_STATE = {
  theSecretWord: "",
  currentGuessWord: "",
  wordleGuesses: [],
  currentTurn: 0,
  isInvalidGuess: false,
} as const satisfies GameState;
