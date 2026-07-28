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

export class GuessDistributionData extends AnyCounterData.extend<GuessDistributionData>("GuessDistributionData")({
  turn: Schema.Int.pipe(Schema.check(Schema.isBetween({ minimum: 1, maximum: 6 }))),
  personalPct: Schema.optional(Schema.Int.pipe(Schema.check(Schema.isBetween({ minimum: 0, maximum: 100 })))),
  globalPct: Schema.optional(Schema.Int.pipe(Schema.check(Schema.isBetween({ minimum: 0, maximum: 100 })))),
}) {}

export class TimeToSolveDistributionData extends AnyCounterData.extend<TimeToSolveDistributionData>("TimeToSolveDistributionData")({
  maxSeconds: Schema.NullOr(Schema.Int.check(Schema.isGreaterThanOrEqualTo(0))),
  personalPct: Schema.optional(Schema.Int.pipe(Schema.check(Schema.isBetween({ minimum: 0, maximum: 100 })))),
  globalPct: Schema.optional(Schema.Int.pipe(Schema.check(Schema.isBetween({ minimum: 0, maximum: 100 })))),
}) {}

export class ArcadeStreakDistributionData extends AnyCounterData.extend<ArcadeStreakDistributionData>("ArcadeStreakDistributionData")({
  streak: Schema.NullOr(Schema.Int.check(Schema.isGreaterThanOrEqualTo(0))),
  personalPct: Schema.optional(Schema.Int.pipe(Schema.check(Schema.isBetween({ minimum: 0, maximum: 100 })))),
  globalPct: Schema.optional(Schema.Int.pipe(Schema.check(Schema.isBetween({ minimum: 0, maximum: 100 })))),
}) {}

export class OpeningGuessesFrequencyData extends AnyCounterData.extend<OpeningGuessesFrequencyData>("OpeningGuessesFrequencyData")({
  word: TheSecretWord,
}) {}

export class FailedWordsFrequencyData extends AnyCounterData.extend<FailedWordsFrequencyData>("FailedWordsFrequencyData")({
  word: TheSecretWord,
}) {}

export class RunDeathReasonFrequencyData extends AnyCounterData.extend<RunDeathReasonFrequencyData>("RunDeathReasonFrequencyData")({
  reason: Schema.Literals(["Forfeit", "Guesses"]),
}) {}

export class HardestWordsLeaderboardData extends Schema.Class<HardestWordsLeaderboardData>("HardestWordsLeaderboardData")({
  word: TheSecretWord,
  personalAvgTimeSeconds: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
  personalAvgGuesses: Schema.NumberFromString.pipe(Schema.check(Schema.isBetween({ minimum: 0, maximum: 6 }))),
  globalAvgTimeSeconds: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
  globalAvgGuesses: Schema.NumberFromString.pipe(Schema.check(Schema.isBetween({ minimum: 0, maximum: 6 }))),
}) {}

export class BestRunTrophyCardArgs extends AnyChartArgs.extend<BestRunTrophyCardArgs>("BestRunTrophyCardArgs")({
  whichBestRun: Schema.Literals(["personal", "global"]),
}) {}

export class BestRunTrophyCardData extends Schema.Class<BestRunTrophyCardData>("BestRunTrophyCardData")({
  deathReason: Schema.Literals(["Forfeit", "Guesses"]),
  failedOnWord: Schema.Union([TheSecretWord, Schema.Literal("N/A")]),
  finalScore: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
  finalStreak: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
  durationSeconds: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
  createdAt: Schema.DateTimeUtcFromDate,
}) {}
