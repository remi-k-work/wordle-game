// types
import type { GameSettings } from "./models";

// constants
export const INITIAL_GAME_SETTINGS = {
  solutionsLanguage: "En",
  voiceVoice: null,
  voiceVolume: 1,
  voiceRate: 1,
  voicePitch: 1,
} as const satisfies GameSettings;

// The voice-setting ranges
export const VOICE_VOLUME_RANGE = { minimum: 0, maximum: 1 } as const;
export const VOICE_RATE_RANGE = { minimum: 0.5, maximum: 2 } as const;
export const VOICE_PITCH_RANGE = { minimum: 0.5, maximum: 1.5 } as const;
