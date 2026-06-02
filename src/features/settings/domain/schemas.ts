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
  voiceVoice: Schema.NullOr(Schema.Trim.pipe(Schema.nonEmptyString())),
  voiceVolume: Schema.Number.pipe(Schema.between(0, 1)),
  voiceRate: Schema.Number.pipe(Schema.between(0.5, 2)),
  voicePitch: Schema.Number.pipe(Schema.between(0.5, 1.5)),
});
