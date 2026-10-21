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

export type GameData = typeof GameData.Type;
export type WordMeta = typeof WordMeta.Type;
export type RunSession = typeof RunSession.Type;
export type RunResult = typeof RunResult.Type;
export type WordScore = typeof WordScore.Type;
export type WordChallenge = typeof WordChallenge.Type;

// A single normalized letter — shared by the grid, keypad, grey-letter set and overdrive hacks
export const Letter = Schema.Trim.pipe(Schema.check(Schema.isBetweenLength(1, 1)));

export const TheSecretWord = Schema.Trim.pipe(Schema.check(Schema.isBetweenLength(WORD_LENGTH, WORD_LENGTH)));

// The word a run died on, or the "N/A" sentinel when the run never reached a
// word (e.g. forfeited during arcade setup). A single string schema (not a
// Union of two string members): SchemaBinary requires union members to be
// uniquely identifiable on the wire, and two plain-string members are not
export const FailedOnWord = Schema.Trim.pipe(
  Schema.check(
    Schema.makeFilter((word: string) => word === "N/A" || word.length === WORD_LENGTH, {
      expected: `a ${WORD_LENGTH}-letter word or "N/A"`,
    })
  )
);
export const SolutionsLanguage = Schema.Literals(["En", "Pl"]);
export const RunDeathReason = Schema.Literals(["Forfeit", "Guesses"]);

// All the available colors for a single tile
export const Color = Schema.Literals(["grey", "yellow", "green", "red", ""]);

// A single tile in the wordle grid
export const Tile = Schema.Struct({ tileKey: Letter, color: Color });

// The wordle grid and the keypad
export const WordleGrid = Schema.Array(Schema.Array(Tile).check(Schema.isMaxLength(WORD_LENGTH))).check(Schema.isMaxLength(MAX_TURNS));
export const Keypad = Schema.Array(Letter);

export const GameData = Schema.Struct({
  solutions: Schema.Option(Schema.Array(TheSecretWord)),
  dictionary: Schema.Option(Schema.HashSet(TheSecretWord)),
  keypad: Schema.Option(Keypad),
});

export const WordMeta = Schema.Struct({
  theRiddle: Schema.Option(Schema.Trim.pipe(Schema.check(Schema.isNonEmpty()))),
  wordDefinition: Schema.Option(Schema.Trim.pipe(Schema.check(Schema.isNonEmpty()))),
  theRiddleAudio: Schema.Option(Schema.Uint8Array),
  wordDefinitionAudio: Schema.Option(Schema.Uint8Array),
});

// Represents the state of the current arcade run (points from individual words accumulate here into a persistent total until a loss occurs)
export const RunSession = Schema.Struct({
  runId: Schema.Option(Schema.Trim.check(Schema.isUUID())),
  createdAt: Schema.Option(Schema.DateTimeUtc),
  runScore: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
  streak: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
  bestRunScore: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
  bestStreak: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
});

// Immutable summary of a completed run. This is intentionally separate from the active persisted session
export const RunResult = Schema.Struct({
  runId: Schema.Trim.check(Schema.isUUID()),
  createdAt: Schema.DateTimeUtc,
  finishedAt: Schema.DateTimeUtc,
  runScore: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
  streak: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
  deathReason: RunDeathReason,
});

// Represents the results of a single word challenge (specifically denotes the volatile points earned for solving a specific word)
export const WordScore = Schema.Struct({
  wordScore: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
  basePointsPerTurn: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
  speedMultiplier: Schema.Finite.check(Schema.isGreaterThanOrEqualTo(0)),
  timeSeconds: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
});

// Represents the state of the current word challenge being in progress
export const WordChallenge = Schema.Struct({
  dictionary: Schema.Option(Schema.HashSet(TheSecretWord)),
  theSecretWord: Schema.Option(TheSecretWord),
  currentGuessWord: Schema.Trim,
  wordleGuesses: Schema.Array(TheSecretWord),
  currentTurn: Schema.Int.check(Schema.isGreaterThanOrEqualTo(1)),
  startTime: Schema.Option(Schema.DateTimeUtc),
  wordScore: Schema.Option(WordScore),
  // Letters ruled out ("grey") by the submitted guesses — maintained at submit
  // time so the per-keypress guard is an O(1) set lookup
  greyLetters: Schema.HashSet(Letter),
});
