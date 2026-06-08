// services, features, and other libraries
import { Struct } from "effect";
import { Atom } from "effect/unstable/reactivity";
import { RuntimeAtom } from "@/lib/runtime-client";
import { GameSettings } from "@/features/settings/domain";

// Persistent storage for game settings
export const gameSettingsAtom = Atom.kvs({
  runtime: RuntimeAtom,
  key: "@wordle/gameSettings",
  schema: GameSettings.mapFields(Struct.pick(["solutionsLanguage", "voiceVoice", "voiceVolume", "voiceRate", "voicePitch"])),
  defaultValue: () => ({ solutionsLanguage: "En", voiceVoice: null, voiceVolume: 1, voiceRate: 1, voicePitch: 1 }) as const satisfies GameSettings,
});

// Specialized selectors for granular state access and optimized re-renders
export const solutionsLanguageAtom = gameSettingsAtom.pipe(Atom.map((state) => state.solutionsLanguage));
export const voiceVoiceAtom = gameSettingsAtom.pipe(Atom.map((state) => state.voiceVoice));
export const voiceVolumeAtom = gameSettingsAtom.pipe(Atom.map((state) => state.voiceVolume));
export const voiceRateAtom = gameSettingsAtom.pipe(Atom.map((state) => state.voiceRate));
export const voicePitchAtom = gameSettingsAtom.pipe(Atom.map((state) => state.voicePitch));
