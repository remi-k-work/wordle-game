// services, features, and other libraries
import { Schema } from "effect";

export const HighScoreSchema = Schema.Struct({
  playerName: Schema.Trim.pipe(Schema.nonEmptyString(), Schema.maxLength(3)),
  score: Schema.Int.pipe(Schema.nonNegative()),
  streak: Schema.Int.pipe(Schema.nonNegative()),
  solutionsLang: Schema.Literal("En", "Pl"),
  createdAt: Schema.DateTimeUtc,
});

export const AddHighScoreSchema = HighScoreSchema.pipe(Schema.omit("createdAt"));
