// services, features, and other libraries
import { Schema } from "effect";
import { SolutionsLanguage, TheSecretWord } from "@/features/game/domain";

export class GuessDistributionArgs extends Schema.Class<GuessDistributionArgs>("GuessDistributionArgs")({
  sessionId: Schema.Trim.check(Schema.isUUID()),
  solutionsLanguage: SolutionsLanguage,
}) {}

class GuessDistributionSchema extends Schema.Class<GuessDistributionSchema>("GuessDistributionSchema")({
  turn: Schema.Int.pipe(Schema.check(Schema.isBetween({ minimum: 1, maximum: 6 }))),
  personal: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
  global: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
  personalPct: Schema.Int.pipe(Schema.check(Schema.isBetween({ minimum: 0, maximum: 100 }))),
  globalPct: Schema.Int.pipe(Schema.check(Schema.isBetween({ minimum: 0, maximum: 100 }))),
}) {}

export const GuessDistributionData = Schema.Array(GuessDistributionSchema);
export type GuessDistributionData = typeof GuessDistributionData.Type;

export class TimeToSolveDistributionArgs extends Schema.Class<TimeToSolveDistributionArgs>("TimeToSolveDistributionArgs")({
  sessionId: Schema.Trim.check(Schema.isUUID()),
  solutionsLanguage: SolutionsLanguage,
}) {}

class TimeToSolveDistributionSchema extends Schema.Class<TimeToSolveDistributionSchema>("TimeToSolveDistributionSchema")({
  maxSeconds: Schema.NullOr(Schema.Int.check(Schema.isGreaterThanOrEqualTo(0))),
  personal: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
  global: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
  personalPct: Schema.Int.pipe(Schema.check(Schema.isBetween({ minimum: 0, maximum: 100 }))),
  globalPct: Schema.Int.pipe(Schema.check(Schema.isBetween({ minimum: 0, maximum: 100 }))),
}) {}

export const TimeToSolveDistributionData = Schema.Array(TimeToSolveDistributionSchema);
export type TimeToSolveDistributionData = typeof TimeToSolveDistributionData.Type;

export class ArcadeStreakDistributionArgs extends Schema.Class<ArcadeStreakDistributionArgs>("ArcadeStreakDistributionArgs")({
  sessionId: Schema.Trim.check(Schema.isUUID()),
  solutionsLanguage: SolutionsLanguage,
}) {}

class ArcadeStreakDistributionSchema extends Schema.Class<ArcadeStreakDistributionSchema>("ArcadeStreakDistributionSchema")({
  streak: Schema.NullOr(Schema.Int.check(Schema.isGreaterThanOrEqualTo(0))),
  personal: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
  global: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
  personalPct: Schema.Int.pipe(Schema.check(Schema.isBetween({ minimum: 0, maximum: 100 }))),
  globalPct: Schema.Int.pipe(Schema.check(Schema.isBetween({ minimum: 0, maximum: 100 }))),
}) {}

export const ArcadeStreakDistributionData = Schema.Array(ArcadeStreakDistributionSchema);
export type ArcadeStreakDistributionData = typeof ArcadeStreakDistributionData.Type;

export class OpeningGuessesFrequencyArgs extends Schema.Class<OpeningGuessesFrequencyArgs>("OpeningGuessesFrequencyArgs")({
  sessionId: Schema.Trim.check(Schema.isUUID()),
  solutionsLanguage: SolutionsLanguage,
}) {}

export class OpeningGuessesFrequencyData extends Schema.Class<OpeningGuessesFrequencyData>("OpeningGuessesFrequencyData")({
  word: TheSecretWord,
  personal: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
  global: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
}) {}

export class FailedWordsFrequencyArgs extends Schema.Class<FailedWordsFrequencyArgs>("FailedWordsFrequencyArgs")({
  sessionId: Schema.Trim.check(Schema.isUUID()),
  solutionsLanguage: SolutionsLanguage,
}) {}

export class FailedWordsFrequencyData extends Schema.Class<FailedWordsFrequencyData>("FailedWordsFrequencyData")({
  word: TheSecretWord,
  personal: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
  global: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
}) {}

export class RunDeathReasonFrequencyArgs extends Schema.Class<RunDeathReasonFrequencyArgs>("RunDeathReasonFrequencyArgs")({
  sessionId: Schema.Trim.check(Schema.isUUID()),
  solutionsLanguage: SolutionsLanguage,
}) {}

export class RunDeathReasonFrequencyData extends Schema.Class<RunDeathReasonFrequencyData>("RunDeathReasonFrequencyData")({
  reason: Schema.Literals(["Forfeit", "Guesses"]),
  personal: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
  global: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
}) {}

export class GamesPlayedCounterArgs extends Schema.Class<GamesPlayedCounterArgs>("GamesPlayedCounterArgs")({
  sessionId: Schema.Trim.check(Schema.isUUID()),
  solutionsLanguage: SolutionsLanguage,
}) {}

export class GamesPlayedCounterData extends Schema.Class<GamesPlayedCounterData>("GamesPlayedCounterData")({
  personal: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
  global: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
}) {}
