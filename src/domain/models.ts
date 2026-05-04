// services, features, and other libraries
import { Data, Schema } from "effect";

// schemas
export const GameDataSchema = Schema.Struct({
  solutions: Schema.Array(Schema.Struct({ word: Schema.Trim })),
  letters: Schema.Array(Schema.Struct({ key: Schema.Trim })),
});
export const GameStatusEnum = Data.taggedEnum<GameStatus>();

// types
export type GameState = Readonly<{
  theSecretWord: string;
  currentGuessWord: string;
  wordleGuesses: Readonly<string[]>;
  currentTurn: number;
}>;

export type Language = "en" | "pl";
export type Color = "grey" | "yellow" | "green" | "";
export type Tile = Readonly<{ tileKey: string; color: Color }>;
export type WordleGrid = Readonly<Tile[][]>;
export type GameData = typeof GameDataSchema.Type;
export type GameStatus = Data.TaggedEnum<{ Playing: object; Won: object; Lost: object }>;
