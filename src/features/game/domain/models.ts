// services, features, and other libraries
import { Schema } from "effect";

// constants
import { MAX_TURNS, WORD_LENGTH } from ".";

// types
export type TheSecretWord = typeof TheSecretWord.Type;
export type SolutionsLanguage = typeof SolutionsLanguage.Type;
export type TheRiddle = typeof TheRiddle.Type;
export type WordDefinition = typeof WordDefinition.Type;
export type RunDeathReason = typeof RunDeathReason.Type;

export type Color = typeof Color.Type;
export type WordleGrid = typeof WordleGrid.Type;
export type Keypad = typeof Keypad.Type;

export const TheSecretWord = Schema.Trim.pipe(Schema.check(Schema.isMinLength(WORD_LENGTH)), Schema.check(Schema.isMaxLength(WORD_LENGTH)));
export const SolutionsLanguage = Schema.Literals(["En", "Pl"]);
export const TheRiddle = Schema.Trim.pipe(Schema.check(Schema.isNonEmpty()));
export const WordDefinition = Schema.Trim.pipe(Schema.check(Schema.isNonEmpty()));
export const RunDeathReason = Schema.Literals(["Forfeit", "Guesses"]);

// All the available colors for a single tile
export const Color = Schema.Literals(["grey", "yellow", "green", "red", ""]);

// A single tile in the wordle grid
export class Tile extends Schema.Class<Tile>("Tile")({ tileKey: Schema.Trim.check(Schema.isNonEmpty(), Schema.isMaxLength(1)), color: Color }) {}

// The wordle grid and the keypad
export const WordleGrid = Schema.Array(Schema.Array(Tile).check(Schema.isMaxLength(WORD_LENGTH))).check(Schema.isMaxLength(MAX_TURNS));
export const Keypad = Schema.Array(Schema.Trim.pipe(Schema.check(Schema.isNonEmpty()), Schema.check(Schema.isMaxLength(1))));

export class GameData extends Schema.Class<GameData>("GameData")({
  solutions: Schema.Option(Schema.Array(TheSecretWord)),
  dictionary: Schema.Option(Schema.HashSet(TheSecretWord)),
  keypad: Schema.Option(Keypad),
}) {}

export class WordMeta extends Schema.Class<WordMeta>("WordMeta")({
  theRiddle: Schema.Option(TheRiddle),
  wordDefinition: Schema.Option(WordDefinition),
}) {}

// Represents the state of the current arcade run (points from individual words accumulate here into a persistent total until a loss occurs)
export class RunSession extends Schema.Class<RunSession>("RunSession")({
  runId: Schema.Option(Schema.Trim.check(Schema.isUUID())),
  createdAt: Schema.Option(Schema.DateTimeUtc),
  runScore: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
  streak: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
  bestRunScore: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
  bestStreak: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
}) {}

// Immutable summary of a completed run. This is intentionally separate from the active persisted session
export class RunResult extends Schema.Class<RunResult>("RunResult")({
  runId: Schema.Trim.check(Schema.isUUID()),
  createdAt: Schema.DateTimeUtc,
  finishedAt: Schema.DateTimeUtc,
  runScore: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
  streak: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
  deathReason: RunDeathReason,
}) {}

// Represents the results of a single word challenge (specifically denotes the volatile points earned for solving a specific word)
export class WordScore extends Schema.Class<WordScore>("WordScore")({
  wordScore: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
  basePointsPerTurn: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
  speedMultiplier: Schema.Number.check(Schema.isGreaterThanOrEqualTo(0)),
  timeSeconds: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
}) {}

// Represents the state of the current word challenge being in progress
export class WordChallenge extends Schema.Class<WordChallenge>("WordChallenge")({
  dictionary: Schema.Option(Schema.HashSet(TheSecretWord)),
  theSecretWord: Schema.Option(TheSecretWord),
  currentGuessWord: Schema.Trim,
  wordleGuesses: Schema.Array(TheSecretWord),
  currentTurn: Schema.Int.check(Schema.isGreaterThanOrEqualTo(1)),
  startTime: Schema.Option(Schema.DateTimeUtc),
  wordScore: Schema.Option(WordScore),
}) {}
