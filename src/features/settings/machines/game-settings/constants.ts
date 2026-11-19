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
