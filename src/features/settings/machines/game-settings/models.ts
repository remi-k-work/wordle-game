// services, features, and other libraries
import { Schema } from "effect";
import { SolutionsLanguage } from "@/features/game/domain/models";
import { Bounded } from "@/features/settings/domain/models";

// types
import type { EventUnion } from "@/lib/machine-setup";
export type GameSettings = typeof GameSettings.Type;
export type Events = EventUnion<typeof Events>;

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

// Events are part of the machine's interface
export const Events = {
  solutionsLanguageToggled: Schema.Struct({}),
  voiceVoiceChanged: Schema.Struct({ voiceVoice: GameSettings.fields.voiceVoice }),
  voiceVolumeChanged: Schema.Struct({ voiceVolume: GameSettings.fields.voiceVolume }),
  voiceRateChanged: Schema.Struct({ voiceRate: GameSettings.fields.voiceRate }),
  voicePitchChanged: Schema.Struct({ voicePitch: GameSettings.fields.voicePitch }),
};

// Action params are part of the machine's interface; implementations receive
// exactly these params (plus `self`)
export const Actions = {
  onSolutionsLanguageToggled: { params: Schema.Struct({ solutionsLanguage: SolutionsLanguage }) },
};
