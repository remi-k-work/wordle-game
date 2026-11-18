// services, features, and other libraries
import { Schema } from "effect";

// constants
import { MAX_TURNS, WORD_LENGTH } from "./constants";

// types
export type TheSecretWord = typeof TheSecretWord.Type;
export type FailedOnWord = typeof FailedOnWord.Type;
export type SolutionsLanguage = typeof SolutionsLanguage.Type;
export type RunDeathReason = typeof RunDeathReason.Type;
export type Color = typeof Color.Type;
export type WordleGrid = typeof WordleGrid.Type;
export type Keypad = typeof Keypad.Type;
export type Letter = typeof Letter.Type;
export type Tile = typeof Tile.Type;
export type WordMeta = typeof WordMeta.Type;
export type WordScore = typeof WordScore.Type;

// A single normalized letter — shared by the grid, keypad, grey-letter set and overdrive hacks
export const Letter = Schema.Trim.check(Schema.isBetweenLength(1, 1));

export const TheSecretWord = Schema.Trim.check(Schema.isBetweenLength(WORD_LENGTH, WORD_LENGTH));

// The word a run died on, or the "N/A" sentinel when the run never reached a
// word (e.g. forfeited during arcade setup); a single string schema (not a
// Union of two string members): SchemaBinary requires union members to be
// uniquely identifiable on the wire, and two plain-string members are not
export const FailedOnWord = Schema.Trim.check(
  Schema.makeFilter((word: string) => word === "N/A" || word.length === WORD_LENGTH, { expected: `a ${WORD_LENGTH}-letter word or "N/A"` })
);

export const SolutionsLanguage = Schema.Literals(["En", "Pl"]);
export const RunDeathReason = Schema.Literals(["Forfeit", "Guesses"]);

// All the available colors for a single tile
export const Color = Schema.Literals(["grey", "yellow", "green", "red", ""]);

// A single tile in the wordle grid
export const Tile = Schema.Struct({ tileKey: Letter, color: Color });

// A tile as the board renders it: the decoded tile plus the presentation fact its leaves need
export type BoardTile = Tile & { readonly isSonarReveal: boolean };

// The wordle grid and the keypad
export const WordleGrid = Schema.Array(Schema.Array(Tile).check(Schema.isMaxLength(WORD_LENGTH))).check(Schema.isMaxLength(MAX_TURNS));
export const Keypad = Schema.Array(Letter);

export const WordMeta = Schema.Struct({
  theRiddle: Schema.Option(Schema.Trim.check(Schema.isNonEmpty())),
  wordDefinition: Schema.Option(Schema.Trim.check(Schema.isNonEmpty())),
  theRiddleAudio: Schema.Option(Schema.Uint8Array),
  wordDefinitionAudio: Schema.Option(Schema.Uint8Array),
});

// Represents the results of a single word challenge (specifically denotes the volatile points earned for solving a specific word)
export const WordScore = Schema.Struct({
  wordScore: Schema.Natural,
  basePointsPerTurn: Schema.Natural,
  speedMultiplier: Schema.Finite.check(Schema.isGreaterThanOrEqualTo(0)),
  timeSeconds: Schema.Natural,
});
