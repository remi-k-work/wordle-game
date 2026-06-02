/* eslint-disable @typescript-eslint/no-explicit-any */

// services, features, and other libraries
import { Atom } from "@effect-atom/atom-react";
import { RuntimeAtom } from "@/lib/runtime-client";
import { GameSettingsSchema } from "@/features/settings/domain";

// Persistent storage for game settings
export const gameSettingsAtom = Atom.kvs({
  runtime: RuntimeAtom as any,
  key: "@wordle/gameSettings",
  schema: GameSettingsSchema,
  defaultValue: () => ({ solutionsLanguage: "En", voiceVoice: null, voiceVolume: 1, voiceRate: 1, voicePitch: 1 }) as const,
});

// Specialized selectors for granular state access and optimized re-renders
export const solutionsLanguageAtom = gameSettingsAtom.pipe(Atom.map((state) => state.solutionsLanguage));
export const voiceVoiceAtom = gameSettingsAtom.pipe(Atom.map((state) => state.voiceVoice));
export const voiceVolumeAtom = gameSettingsAtom.pipe(Atom.map((state) => state.voiceVolume));
export const voiceRateAtom = gameSettingsAtom.pipe(Atom.map((state) => state.voiceRate));
export const voicePitchAtom = gameSettingsAtom.pipe(Atom.map((state) => state.voicePitch));
