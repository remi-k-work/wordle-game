// services, features, and other libraries
import { Schema } from "effect";
import { SolutionsLanguage, TheSecretWord } from "@/features/game/domain";

export class AnyChartArgs extends Schema.Class<AnyChartArgs>("AnyChartArgs")({
  sessionId: Schema.Trim.check(Schema.isUUID()),
  solutionsLanguage: SolutionsLanguage,
}) {}

export class AnyCounterArgs extends AnyChartArgs.extend<AnyCounterArgs>("AnyCounterArgs")({
  counterName: Schema.Literals(["gamesPlayed", "runsStarted", "perfectGames", "invalidGuesses", "validGuesses"]),
}) {}

export class AnyAvgStatArgs extends AnyChartArgs.extend<AnyAvgStatArgs>("AnyAvgStatArgs")({
  statColumn: Schema.Literals(["guessedTurn", "timeSeconds", "finalScore", "finalStreak", "durationSeconds"]),
  statTable: Schema.Literals(["runWordEvent", "arcadeRunSummary"]),
}) {}

export class AnyCounterData extends Schema.Class<AnyCounterData>("AnyCounterData")({
  personal: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
  global: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
}) {}

export class GuessDistributionData extends Schema.Class<GuessDistributionData>("GuessDistributionData")({
  turn: Schema.Int.pipe(Schema.check(Schema.isBetween({ minimum: 1, maximum: 6 }))),
  personal: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
  global: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
  personalPct: Schema.optional(Schema.Int.pipe(Schema.check(Schema.isBetween({ minimum: 0, maximum: 100 })))),
  globalPct: Schema.optional(Schema.Int.pipe(Schema.check(Schema.isBetween({ minimum: 0, maximum: 100 })))),
}) {}

export class TimeToSolveDistributionData extends Schema.Class<TimeToSolveDistributionData>("TimeToSolveDistributionData")({
  maxSeconds: Schema.NullOr(Schema.Int.check(Schema.isGreaterThanOrEqualTo(0))),
  personal: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
  global: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
  personalPct: Schema.optional(Schema.Int.pipe(Schema.check(Schema.isBetween({ minimum: 0, maximum: 100 })))),
  globalPct: Schema.optional(Schema.Int.pipe(Schema.check(Schema.isBetween({ minimum: 0, maximum: 100 })))),
}) {}

export class ArcadeStreakDistributionData extends Schema.Class<ArcadeStreakDistributionData>("ArcadeStreakDistributionData")({
  streak: Schema.NullOr(Schema.Int.check(Schema.isGreaterThanOrEqualTo(0))),
  personal: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
  global: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
  personalPct: Schema.optional(Schema.Int.pipe(Schema.check(Schema.isBetween({ minimum: 0, maximum: 100 })))),
  globalPct: Schema.optional(Schema.Int.pipe(Schema.check(Schema.isBetween({ minimum: 0, maximum: 100 })))),
}) {}

export class OpeningGuessesFrequencyData extends Schema.Class<OpeningGuessesFrequencyData>("OpeningGuessesFrequencyData")({
  word: TheSecretWord,
  personal: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
  global: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
}) {}

export class FailedWordsFrequencyData extends Schema.Class<FailedWordsFrequencyData>("FailedWordsFrequencyData")({
  word: TheSecretWord,
  personal: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
  global: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
}) {}

export class RunDeathReasonFrequencyData extends Schema.Class<RunDeathReasonFrequencyData>("RunDeathReasonFrequencyData")({
  reason: Schema.Literals(["Forfeit", "Guesses"]),
  personal: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
  global: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
}) {}
