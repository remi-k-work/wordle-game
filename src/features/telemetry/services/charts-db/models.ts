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

// E3: dedicated Result schema for any-avg-stat. The shape is structurally
// identical to AnyCounterData (personal, global — both non-negative ints),
// and the wire format the RPC serialises is the same `{ personal, global }`
// object either way, so this is a pure type-level rename with no client-
// visible change. Defining it as an empty extension (rather than a type
// alias) gives an independent evolution point — if any-avg-stat ever needs
// a discriminator of its own (e.g. a `count` field for sample-size
// surfacing alongside the average), this schema can grow without touching
// AnyCounterData or its other subclasses. Mirrors the extend pattern used
// by every other *Data schema in this file.
export class AnyAvgStatData extends AnyCounterData.extend<AnyAvgStatData>("AnyAvgStatData")({}) {}

export class GuessDistributionData extends AnyCounterData.extend<GuessDistributionData>("GuessDistributionData")({
  turn: Schema.NullOr(Schema.Int.pipe(Schema.check(Schema.isBetween({ minimum: 1, maximum: 6 })))),
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
  // B3: the precision is load-bearing — the SQL emits ROUND(AVG(guessed_turn)::numeric, 1) (a one-decimal numeric like 3.4), and the consumer in
  // ui/charts/leaderboards/hardest-words/index.tsx renders it via .toFixed(1). Do NOT "tighten" to Schema.Int without first switching the SQL
  // to ROUND(AVG(guessed_turn))::int AND auditing the consumer (the .toFixed(1) call sites on lines 62 and 64). The avgTimeSeconds fields
  // ARE rendered as integers (Duration.seconds → formatDuration), hence Schema.Int there. This precision asymmetry is intentional.
  personalAvgGuesses: Schema.NumberFromString.pipe(Schema.check(Schema.isBetween({ minimum: 0, maximum: 6 }))),
  globalAvgTimeSeconds: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
  globalAvgGuesses: Schema.NumberFromString.pipe(Schema.check(Schema.isBetween({ minimum: 0, maximum: 6 }))),
}) {}

export class BestRunTrophyCardArgs extends AnyChartArgs.extend<BestRunTrophyCardArgs>("BestRunTrophyCardArgs")({
  whichBestRun: Schema.Literals(["personal", "global"]),
}) {}

export class BestRunTrophyCardData extends Schema.Class<BestRunTrophyCardData>("BestRunTrophyCardData")({
  deathReason: Schema.Literals(["Forfeit", "Guesses"]),
  // E4: "N/A" is the producer's sentinel for Forfeit runs (see
  // telemetry/state/actions.ts:36 — `failedOnWord = deathReason === "Guesses" ? theSecretWord : "N/A"`).
  // TheSecretWord requires exactly 5 characters (WORD_LENGTH = 5); "N/A" is 3 chars,
  // so it cannot collide with a real secret word. Do NOT remove this union arm —
  // it is load-bearing for Forfeit-run rendering.
  failedOnWord: Schema.Union([TheSecretWord, Schema.Literal("N/A")]),
  finalScore: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
  finalStreak: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
  durationSeconds: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
  createdAt: Schema.DateTimeUtcFromDate,
}) {}
