// types
import type { GameSettings } from ".";

export const changeSolutionsLanguage = ({ solutionsLanguage, ...gameSettings }: GameSettings) =>
  ({
    ...gameSettings,
    solutionsLanguage: solutionsLanguage === "En" ? "Pl" : "En",
  }) as const;

export const changeVoiceVoice = (gameSettings: GameSettings, newVoiceVoice: string) => ({ ...gameSettings, voiceVoice: newVoiceVoice }) as const;
export const changeVoiceVolume = (gameSettings: GameSettings, newVoiceVolume: number) => ({ ...gameSettings, voiceVolume: newVoiceVolume }) as const;
export const changeVoiceRate = (gameSettings: GameSettings, newVoiceRate: number) => ({ ...gameSettings, voiceRate: newVoiceRate }) as const;
export const changeVoicePitch = (gameSettings: GameSettings, newVoicePitch: number) => ({ ...gameSettings, voicePitch: newVoicePitch }) as const;
