// services, features, and other libraries
import { Schema } from "effect";

// types
export type TheSecretWord = Schema.Schema.Type<typeof TheSecretWordSchema>;
export type SolutionsLanguage = Schema.Schema.Type<typeof SolutionsLanguageSchema>;
export type RunSession = Schema.Schema.Type<typeof RunSessionSchema>;

export const TheSecretWordSchema = Schema.Trim.pipe(Schema.check(Schema.isNonEmpty()), Schema.check(Schema.isMaxLength(5)));
export const SolutionsLanguageSchema = Schema.Literals(["En", "Pl"]);

// Represents the state of the current arcade run (points from individual words accumulate here into a persistent total until a loss occurs)
export const RunSessionSchema = Schema.Struct({
  runScore: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
  streak: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
  lastRunScore: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
  lastStreak: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
  bestRunScore: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
  bestStreak: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
});
