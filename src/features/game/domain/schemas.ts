// services, features, and other libraries
import { Schema } from "effect";

export const TheSecretWordSchema = Schema.Trim.pipe(Schema.nonEmptyString(), Schema.maxLength(5));
export const SolutionsLanguageSchema = Schema.Literal("En", "Pl");

export const SolutionsDataSchema = Schema.Array(TheSecretWordSchema);
export const KeypadDataSchema = Schema.Array(Schema.Trim.pipe(Schema.nonEmptyString(), Schema.maxLength(1)));

export const GameSettingsSchema = Schema.Struct({ solutionsLanguage: SolutionsLanguageSchema });

export const RunSessionSchema = Schema.Struct({
  runScore: Schema.Int.pipe(Schema.nonNegative()),
  streak: Schema.Int.pipe(Schema.nonNegative()),
  lastRunScore: Schema.Int.pipe(Schema.nonNegative()),
  lastStreak: Schema.Int.pipe(Schema.nonNegative()),
  bestRunScore: Schema.Int.pipe(Schema.nonNegative()),
  bestStreak: Schema.Int.pipe(Schema.nonNegative()),
});

export const RiddleRequestSchema = Schema.Struct({ theSecretWord: TheSecretWordSchema, solutionsLanguage: SolutionsLanguageSchema });
export const RiddleResponseSchema = Schema.Struct({ riddle: Schema.Trim });
