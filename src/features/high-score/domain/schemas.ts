// services, features, and other libraries
import { Schema } from "effect";
import { SolutionsLanguageSchema } from "@/features/game/domain";

// types
export type HighScore = Schema.Schema.Type<typeof HighScoreSchema>;
export type AddHighScore = Schema.Schema.Type<typeof AddHighScoreSchema>;

// Represents the high score entry for a player
export const HighScoreSchema = Schema.Struct({
  playerName: Schema.Trim.pipe(Schema.nonEmptyString(), Schema.maxLength(3)),
  score: Schema.Int.pipe(Schema.nonNegative()),
  streak: Schema.Int.pipe(Schema.nonNegative()),
  solutionsLang: SolutionsLanguageSchema,
  createdAt: Schema.DateTimeUtc,
});

// The schema for adding a new high score entry (the required fields only)
export const AddHighScoreSchema = HighScoreSchema.pipe(Schema.omit("createdAt"));
