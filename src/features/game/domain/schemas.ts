// services, features, and other libraries
import { Schema } from "effect";

export const TheSecretWordSchema = Schema.Trim.pipe(Schema.nonEmptyString(), Schema.maxLength(5));
export const SolutionsLanguageSchema = Schema.Literal("En", "Pl");

export const GameSettingsSchema = Schema.Struct({ solutionsLanguage: SolutionsLanguageSchema });

export const RunSessionSchema = Schema.Struct({
  runScore: Schema.Int.pipe(Schema.nonNegative()),
  streak: Schema.Int.pipe(Schema.nonNegative()),
  lastRunScore: Schema.Int.pipe(Schema.nonNegative()),
  lastStreak: Schema.Int.pipe(Schema.nonNegative()),
  bestRunScore: Schema.Int.pipe(Schema.nonNegative()),
  bestStreak: Schema.Int.pipe(Schema.nonNegative()),
});
