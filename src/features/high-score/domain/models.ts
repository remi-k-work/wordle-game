// services, features, and other libraries
import { Effect, Schema } from "effect";
import { SolutionsLanguage } from "@/features/game/domain/models";
import { BasePage } from "@/domain/models";

// Represents the high score entry for a player
export class HighScore extends Schema.Class<HighScore>("HighScore")({
  id: Schema.Int.check(Schema.isGreaterThan(0)),
  playerName: Schema.Trim.pipe(Schema.check(Schema.isNonEmpty()), Schema.check(Schema.isMaxLength(3))),
  score: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
  streak: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
  solutionsLang: SolutionsLanguage,
  // The pg client (v4 stable) decodes `timestamptz` columns as JS `Date`
  // instances (it decoded epoch millis in the v4 beta), so the DB boundary
  // schema must accept `Date` and turn it into a `DateTime.Utc`
  createdAt: Schema.DateTimeUtcFromDate,
}) {}

// The schema for adding a new high score entry (the required fields only)
export class AddHighScore extends Schema.Class<AddHighScore>("AddHighScore")({
  playerName: HighScore.fields.playerName,
  score: HighScore.fields.score,
  streak: HighScore.fields.streak,
  solutionsLang: HighScore.fields.solutionsLang,
}) {}

export class HighScoreMachineContext extends Schema.Class<HighScoreMachineContext>("HighScoreMachineContext")({
  playerName: HighScore.fields.playerName,
  runScore: HighScore.fields.score,
  streak: HighScore.fields.streak,
  solutionsLanguage: HighScore.fields.solutionsLang,
  newHighScoreId: Schema.Option(HighScore.fields.id),
}) {}

// The high score page with all its inputs (params and searchParams)
export class HighScorePage extends BasePage.extend<HighScorePage>("HighScorePage")({
  searchParams: Schema.Struct({ sl: SolutionsLanguage.pipe(Schema.withDecodingDefault(Effect.succeed("En"))) }),
}) {}
