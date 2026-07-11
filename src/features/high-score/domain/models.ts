// services, features, and other libraries
import { Schema } from "effect";
import { SolutionsLanguage } from "@/features/game/domain";

// Represents the high score entry for a player
export class HighScore extends Schema.Class<HighScore>("HighScore")({
  playerName: Schema.Trim.pipe(Schema.check(Schema.isNonEmpty()), Schema.check(Schema.isMaxLength(3))),
  score: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
  streak: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
  solutionsLang: SolutionsLanguage,
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
}) {}
