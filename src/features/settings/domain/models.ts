// services, features, and other libraries
import { Schema } from "effect";
import { SolutionsLanguage } from "@/features/game/domain/models";

// types
export type GameSettings = typeof GameSettings.Type;

// Persistent storage for game settings
export const GameSettings = Schema.Struct({
  solutionsLanguage: SolutionsLanguage,
  voiceVoice: Schema.NullOr(Schema.Trim.pipe(Schema.check(Schema.isNonEmpty()))),
  voiceVolume: Schema.Finite.pipe(Schema.check(Schema.isBetween({ minimum: 0, maximum: 1 }))),
  voiceRate: Schema.Finite.pipe(Schema.check(Schema.isBetween({ minimum: 0.5, maximum: 2 }))),
  voicePitch: Schema.Finite.pipe(Schema.check(Schema.isBetween({ minimum: 0.5, maximum: 1.5 }))),
});
