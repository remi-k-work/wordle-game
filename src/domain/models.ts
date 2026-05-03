import { Data, Schema } from "effect";

// schemas
export const LanguageSchema = Schema.Literal("en", "pl");
export const ColorSchema = Schema.Literal("grey", "yellow", "green", "");
export const TileSchema = Schema.Struct({ tileKey: Schema.String, color: ColorSchema });
export const LetterSchema = Schema.Struct({ key: Schema.String });
export const GameDataSchema = Schema.Struct({ solutions: Schema.Array(Schema.Struct({ word: Schema.String })), letters: Schema.Array(LetterSchema) });
export const GameStatusEnum = Data.taggedEnum<GameStatus>();

// types
export interface GameState {
  readonly theSecretWord: string;
  readonly currentGuessWord: string;
  readonly wordleGuesses: readonly string[];
  readonly currentTurn: number;
}

export type Language = typeof LanguageSchema.Type;
export type Color = typeof ColorSchema.Type;
export type Tile = typeof TileSchema.Type;
export type Letter = typeof LetterSchema.Type;
export type GameData = typeof GameDataSchema.Type;
export type GameStatus = Data.TaggedEnum<{ Playing: object; Won: object; Lost: object }>;
