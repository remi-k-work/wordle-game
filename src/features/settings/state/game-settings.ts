// services, features, and other libraries
import { Struct } from "effect";
import { Atom } from "effect/unstable/reactivity";
import { RuntimeAtom } from "@/lib/runtime-client";
import { GameSettings } from "@/features/settings/domain";
import { gameSettingsMachine } from "@/features/settings/machines/game-settings";
import { createMachineAtom } from "@/lib/machine-atom";

// constants
import { INITIAL_GAME_SETTINGS } from "@/features/settings/domain";

// Persistent storage for game settings
const gameSettingsAtom = Atom.kvs({
  runtime: RuntimeAtom,
  key: "@wordle/gameSettings",
  schema: GameSettings.mapFields(Struct.pick(["solutionsLanguage", "voiceVoice", "voiceVolume", "voiceRate", "voicePitch"])),
  defaultValue: () => INITIAL_GAME_SETTINGS,
}).pipe(Atom.keepAlive);

// The game settings machine is now a living actor inside the effect atom, hydrated from (and
// persisting back to) durable storage on every snapshot.
export const gameSettingsMachineAtom = createMachineAtom(gameSettingsMachine, {
  input: (get) => get.once(gameSettingsAtom),
  onSnapshot: (get, snapshot) => {
    // Save back to local storage
    get.set(gameSettingsAtom, snapshot.context);
  },
});

// Specialized selectors for granular state access and optimized re-renders
export const gameSettingsSolutionsLanguageAtom = gameSettingsMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.solutionsLanguage));
export const gameSettingsVoiceAtom = gameSettingsMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.voiceVoice));
export const gameSettingsVoiceVolumeAtom = gameSettingsMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.voiceVolume));
export const gameSettingsVoiceRateAtom = gameSettingsMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.voiceRate));
export const gameSettingsVoicePitchAtom = gameSettingsMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.voicePitch));
