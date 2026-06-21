// services, features, and other libraries
import { Schema } from "effect";
import { SolutionsLanguage, TheSecretWord } from "@/features/game/domain";

export class AddGlobalPulse extends Schema.Class<AddGlobalPulse>("AddGlobalPulse")({
  sessionId: Schema.Trim.check(Schema.isUUID()),
  instanceId: Schema.Trim.check(Schema.isUUID()),
  solutionsLanguage: SolutionsLanguage,
  metricName: Schema.Trim.pipe(Schema.check(Schema.isNonEmpty()), Schema.check(Schema.isMaxLength(50))),
  metricPayload: Schema.Unknown,
}) {}

export class AddArcadeRunSummary extends Schema.Class<AddArcadeRunSummary>("AddArcadeRunSummary")({
  runId: Schema.Trim.check(Schema.isUUID()),
  sessionId: Schema.Trim.check(Schema.isUUID()),
  solutionsLanguage: SolutionsLanguage,
  deathReason: Schema.Literals(["Forfeit", "Guesses"]),
  failedOnWord: Schema.Union([TheSecretWord, Schema.Literal("N/A")]),
  finalScore: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
  finalStreak: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
  durationSeconds: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
}) {}

export class AddRunWordEvent extends Schema.Class<AddRunWordEvent>("AddRunWordEvent")({
  runId: Schema.Trim.check(Schema.isUUID()),
  solutionsLanguage: SolutionsLanguage,
  theSecretWord: TheSecretWord,
  guessedTurn: Schema.Int.pipe(Schema.check(Schema.isBetween({ minimum: 1, maximum: 6 }))),
  timeSeconds: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
}) {}
