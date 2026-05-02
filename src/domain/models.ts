import * as Schema from "effect/Schema";
import * as Data from "effect/Data";

export const Language = Schema.Literal("en", "pl");
export type Language = typeof Language.Type;

export const Color = Schema.Literal("grey", "yellow", "green", "");
export type Color = typeof Color.Type;

export const Tile = Schema.Struct({
  tileKey: Schema.String,
  color: Color,
});
export type Tile = typeof Tile.Type;

export const Letter = Schema.Struct({
  key: Schema.String,
});
export type Letter = typeof Letter.Type;

export const GameData = Schema.Struct({
  solutions: Schema.Array(Schema.Struct({ word: Schema.String })),
  letters: Schema.Array(Letter),
});
export type GameData = typeof GameData.Type;

export const GameStatus = Data.TaggedEnum<{
  Playing: {};
  Won: {};
  Lost: {};
}>();
export type GameStatus = Data.TaggedEnum.Infer<typeof GameStatus>;

export interface GameState {
  readonly theSecretWord: string;
  readonly currentGuessWord: string;
  readonly wordleGuesses: readonly string[];
  readonly currentTurn: number;
}
