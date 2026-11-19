// services, features, and other libraries
import { Schema } from "effect";
import { SolutionsLanguage } from "@/features/game/domain/models";
import { Bounded } from "@/features/settings/domain/models";

// types
export type GameSettings = typeof GameSettings.Type;

// constants
import { VOICE_PITCH_RANGE, VOICE_RATE_RANGE, VOICE_VOLUME_RANGE } from "@/features/settings/domain/constants";

// Persistent storage for game settings
export const GameSettings = Schema.Struct({
  solutionsLanguage: SolutionsLanguage,
  voiceVoice: Schema.NullOr(Schema.Trim.check(Schema.isNonEmpty())),
  voiceVolume: Bounded(VOICE_VOLUME_RANGE.minimum, VOICE_VOLUME_RANGE.maximum),
  voiceRate: Bounded(VOICE_RATE_RANGE.minimum, VOICE_RATE_RANGE.maximum),
  voicePitch: Bounded(VOICE_PITCH_RANGE.minimum, VOICE_PITCH_RANGE.maximum),
});
