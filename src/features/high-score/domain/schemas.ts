// services, features, and other libraries
import { Schema, Struct } from "effect";
import { SolutionsLanguageSchema } from "@/features/game/domain";

// types
export type HighScore = Schema.Schema.Type<typeof HighScoreSchema>;
export type AddHighScore = Schema.Schema.Type<typeof AddHighScoreSchema>;

// Represents the high score entry for a player
export const HighScoreSchema = Schema.Struct({
  playerName: Schema.Trim.pipe(Schema.check(Schema.isNonEmpty()), Schema.check(Schema.isMaxLength(3))),
  score: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
  streak: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
  solutionsLang: SolutionsLanguageSchema,
  createdAt: Schema.DateTimeUtc,
});

// The schema for adding a new high score entry (the required fields only)
export const AddHighScoreSchema = HighScoreSchema.mapFields(Struct.omit(["createdAt"]));
