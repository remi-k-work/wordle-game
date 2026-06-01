// services, features, and other libraries
import { Schema } from "effect";

export const TheSecretWordSchema = Schema.Trim.pipe(Schema.nonEmptyString(), Schema.maxLength(5));
export const SolutionsLanguageSchema = Schema.Literal("En", "Pl");

export const GameSettingsSchema = Schema.Struct({
  solutionsLanguage: SolutionsLanguageSchema,
  voiceVoice: Schema.NullOr(Schema.Trim.pipe(Schema.nonEmptyString())),
  voiceVolume: Schema.Number.pipe(Schema.between(0, 1)),
  voiceRate: Schema.Number.pipe(Schema.between(0.1, 10)),
  voicePitch: Schema.Number.pipe(Schema.between(0, 2)),
});

export const RunSessionSchema = Schema.Struct({
  runScore: Schema.Int.pipe(Schema.nonNegative()),
  streak: Schema.Int.pipe(Schema.nonNegative()),
  lastRunScore: Schema.Int.pipe(Schema.nonNegative()),
  lastStreak: Schema.Int.pipe(Schema.nonNegative()),
  bestRunScore: Schema.Int.pipe(Schema.nonNegative()),
  bestStreak: Schema.Int.pipe(Schema.nonNegative()),
});
