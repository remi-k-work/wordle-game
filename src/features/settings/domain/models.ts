// services, features, and other libraries
import { Schema } from "effect";
import { SolutionsLanguage } from "@/features/game/domain/models";

// types
export type GameSettings = typeof GameSettings.Type;

// A finite number constrained to an inclusive range (volume, rate, pitch)
const Bounded = (minimum: number, maximum: number) => Schema.Finite.check(Schema.isBetween({ minimum, maximum }));

// Persistent storage for game settings
// Fields are required: decoding an older payload that lacks a newly added
// field would fail, so any future field must be `Schema.optional` (or carry a
// `withDecodingDefault`) to stay backward compatible with stored settings
export const GameSettings = Schema.Struct({
  solutionsLanguage: SolutionsLanguage,
  voiceVoice: Schema.NullOr(Schema.Trim.check(Schema.isNonEmpty())),
  voiceVolume: Bounded(0, 1),
  voiceRate: Bounded(0.5, 2),
  voicePitch: Bounded(0.5, 1.5),
});
