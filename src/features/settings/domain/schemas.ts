// services, features, and other libraries
import { Schema } from "effect";
import { SolutionsLanguageSchema } from "@/features/game/domain";

// types
export type GameSettings = Schema.Schema.Type<typeof GameSettingsSchema>;
export type VoiceVoice = Schema.Schema.Type<typeof GameSettingsSchema>["voiceVoice"];
export type VoiceVolume = Schema.Schema.Type<typeof GameSettingsSchema>["voiceVolume"];
export type VoiceRate = Schema.Schema.Type<typeof GameSettingsSchema>["voiceRate"];
export type VoicePitch = Schema.Schema.Type<typeof GameSettingsSchema>["voicePitch"];

// Persistent storage for game settings
export const GameSettingsSchema = Schema.Struct({
  solutionsLanguage: SolutionsLanguageSchema,
  voiceVoice: Schema.NullOr(Schema.Trim.pipe(Schema.check(Schema.isNonEmpty()))),
  voiceVolume: Schema.Number.pipe(Schema.check(Schema.isBetween({ minimum: 0, maximum: 1 }))),
  voiceRate: Schema.Number.pipe(Schema.check(Schema.isBetween({ minimum: 0.5, maximum: 2 }))),
  voicePitch: Schema.Number.pipe(Schema.check(Schema.isBetween({ minimum: 0.5, maximum: 1.5 }))),
});
