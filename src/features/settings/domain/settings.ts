// services, features, and other libraries
import { GameSettings } from "@/features/settings/domain";

// To change and manage game settings
export const changeSolutionsLanguage = ({ solutionsLanguage, ...gameSettings }: GameSettings) =>
  ({
    ...gameSettings,
    solutionsLanguage: solutionsLanguage === "En" ? "Pl" : "En",
  }) as const;

// The voice related settings
export const changeVoiceVoice = (gameSettings: GameSettings, newVoiceVoice: GameSettings["voiceVoice"]) =>
  ({ ...gameSettings, voiceVoice: newVoiceVoice }) as const;
export const changeVoiceVolume = (gameSettings: GameSettings, newVoiceVolume: GameSettings["voiceVolume"]) =>
  ({ ...gameSettings, voiceVolume: newVoiceVolume }) as const;
export const changeVoiceRate = (gameSettings: GameSettings, newVoiceRate: GameSettings["voiceRate"]) => ({ ...gameSettings, voiceRate: newVoiceRate }) as const;
export const changeVoicePitch = (gameSettings: GameSettings, newVoicePitch: GameSettings["voicePitch"]) =>
  ({ ...gameSettings, voicePitch: newVoicePitch }) as const;
