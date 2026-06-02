// services, features, and other libraries
import { Schema } from "effect";

// types
export type TheSecretWord = Schema.Schema.Type<typeof TheSecretWordSchema>;
export type SolutionsLanguage = Schema.Schema.Type<typeof SolutionsLanguageSchema>;
export type RunSession = Schema.Schema.Type<typeof RunSessionSchema>;

export const TheSecretWordSchema = Schema.Trim.pipe(Schema.nonEmptyString(), Schema.maxLength(5));
export const SolutionsLanguageSchema = Schema.Literal("En", "Pl");

// Represents the state of the current arcade run (points from individual words accumulate here into a persistent total until a loss occurs)
export const RunSessionSchema = Schema.Struct({
  runScore: Schema.Int.pipe(Schema.nonNegative()),
  streak: Schema.Int.pipe(Schema.nonNegative()),
  lastRunScore: Schema.Int.pipe(Schema.nonNegative()),
  lastStreak: Schema.Int.pipe(Schema.nonNegative()),
  bestRunScore: Schema.Int.pipe(Schema.nonNegative()),
  bestStreak: Schema.Int.pipe(Schema.nonNegative()),
});
