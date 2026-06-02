// types
import type { GameSettings, VoicePitch, VoiceRate, VoiceVoice, VoiceVolume } from ".";

// To change and manage game settings
export const changeSolutionsLanguage = ({ solutionsLanguage, ...gameSettings }: GameSettings) =>
  ({
    ...gameSettings,
    solutionsLanguage: solutionsLanguage === "En" ? "Pl" : "En",
  }) as const;

// The voice related settings
export const changeVoiceVoice = (gameSettings: GameSettings, newVoiceVoice: VoiceVoice) => ({ ...gameSettings, voiceVoice: newVoiceVoice }) as const;
export const changeVoiceVolume = (gameSettings: GameSettings, newVoiceVolume: VoiceVolume) => ({ ...gameSettings, voiceVolume: newVoiceVolume }) as const;
export const changeVoiceRate = (gameSettings: GameSettings, newVoiceRate: VoiceRate) => ({ ...gameSettings, voiceRate: newVoiceRate }) as const;
export const changeVoicePitch = (gameSettings: GameSettings, newVoicePitch: VoicePitch) => ({ ...gameSettings, voicePitch: newVoicePitch }) as const;
