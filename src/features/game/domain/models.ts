// services, features, and other libraries
import { Schema } from "effect";

// constants
import { MAX_TURNS, WORD_LENGTH } from ".";

// types
export type TheSecretWord = typeof TheSecretWord.Type;
export type SolutionsLanguage = typeof SolutionsLanguage.Type;
export type Color = typeof Color.Type;
export type WordleGrid = typeof WordleGrid.Type;

export const TheSecretWord = Schema.Trim.pipe(Schema.check(Schema.isNonEmpty()), Schema.check(Schema.isMaxLength(WORD_LENGTH)));
export const SolutionsLanguage = Schema.Literals(["En", "Pl"]);

// All the available colors for a single tile
export const Color = Schema.Literals(["grey", "yellow", "green", "red", ""]);

// A single tile in the game board
export class Tile extends Schema.Class<Tile>("Tile")({
  tileKey: Schema.Trim.check(Schema.isNonEmpty(), Schema.isMaxLength(1)),
  color: Color,
}) {}

// The game board
export const WordleGrid = Schema.Array(Schema.Array(Tile).check(Schema.isMaxLength(WORD_LENGTH))).check(Schema.isMaxLength(MAX_TURNS));

// Represents the state of the current arcade run (points from individual words accumulate here into a persistent total until a loss occurs)
export class RunSession extends Schema.Class<RunSession>("RunSession")({
  runId: Schema.Option(Schema.Trim.check(Schema.isUUID())),
  createdAt: Schema.Option(Schema.DateTimeUtc),
  runScore: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
  streak: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
  lastRunScore: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
  lastStreak: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
  bestRunScore: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
  bestStreak: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
}) {}

// Represents the results of a single word challenge (specifically denotes the volatile points earned for solving a specific word)
export class WordScore extends Schema.Class<WordScore>("WordScore")({
  wordScore: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
  basePointsPerTurn: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
  speedMultiplier: Schema.Number.check(Schema.isGreaterThanOrEqualTo(0)),
  timeSeconds: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
}) {}

// Represents the state of the current game challenge being in progress
export class GameState extends Schema.Class<GameState>("GameState")({
  solutions: Schema.Option(Schema.Array(TheSecretWord)),
  dictionary: Schema.Option(Schema.HashSet(TheSecretWord)),
  theSecretWord: TheSecretWord,
  currentGuessWord: Schema.Trim.check(Schema.isNonEmpty()),
  wordleGuesses: Schema.Array(TheSecretWord),
  currentTurn: Schema.Int.check(Schema.isGreaterThanOrEqualTo(1)),
  startTime: Schema.Option(Schema.DateTimeUtc),
  wordScore: Schema.Option(WordScore),
}) {}
