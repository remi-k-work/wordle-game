// services, features, and other libraries
import { Schema } from "effect";
import { SolutionsLanguage } from "@/features/game/domain/models";

// types
export type GameSettings = typeof GameSettings.Type;

// constants
import { VOICE_PITCH_RANGE, VOICE_RATE_RANGE, VOICE_VOLUME_RANGE } from "./constants";

// A finite number constrained to an inclusive range (volume, rate, pitch)
const Bounded = (minimum: number, maximum: number) => Schema.Finite.check(Schema.isBetween({ minimum, maximum }));

// Persistent storage for game settings
// Fields are required: decoding an older payload that lacks a newly added
// field would fail, so any future field must be `Schema.optional` (or carry a
// `withDecodingDefault`) to stay backward compatible with stored settings
export const GameSettings = Schema.Struct({
  solutionsLanguage: SolutionsLanguage,
  voiceVoice: Schema.NullOr(Schema.Trim.check(Schema.isNonEmpty())),
  voiceVolume: Bounded(VOICE_VOLUME_RANGE.minimum, VOICE_VOLUME_RANGE.maximum),
  voiceRate: Bounded(VOICE_RATE_RANGE.minimum, VOICE_RATE_RANGE.maximum),
  voicePitch: Bounded(VOICE_PITCH_RANGE.minimum, VOICE_PITCH_RANGE.maximum),
});
