// services, features, and other libraries
import { Equal } from "effect";
import { Atom } from "effect/reactivity";
import { RuntimeAtom } from "@/lib/runtime-client";
import { GameSettings } from "@/features/settings/domain/models";
import { gameSettingsMachine } from "@/features/settings/machines/game-settings";
import { createMachineAtom } from "@/domain/machine-atom";

// constants
import { INITIAL_GAME_SETTINGS } from "@/features/settings/domain/constants";

// Persistent storage for game settings
const gameSettingsAtom = Atom.kvs({
  runtime: RuntimeAtom,
  key: "@wordle/gameSettings",
  schema: GameSettings,
  defaultValue: () => INITIAL_GAME_SETTINGS,
}).pipe(Atom.keepAlive);

// The game settings machine is now a living actor inside the effect atom, hydrated from (and persisting back to) durable storage on every snapshot
export const gameSettingsMachineAtom = createMachineAtom(gameSettingsMachine, {
  input: (get) => get.once(gameSettingsAtom),
  onSnapshot: (get, snapshot) => {
    // Save back to local storage only when the context actually changed:
    // onSnapshot fires for every snapshot — including the first one, which
    // merely re-reads what was just hydrated — and persisting an identical
    // value back is a wasted localStorage round-trip
    if (Equal.equals(get.once(gameSettingsAtom), snapshot.context)) return;
    get.set(gameSettingsAtom, snapshot.context);
  },
});

// Specialized selectors for granular state access and optimized re-renders
export const gameSettingsSolutionsLanguageAtom = gameSettingsMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.solutionsLanguage));
export const gameSettingsVoiceAtom = gameSettingsMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.voiceVoice));
export const gameSettingsVoiceVolumeAtom = gameSettingsMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.voiceVolume));
export const gameSettingsVoiceRateAtom = gameSettingsMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.voiceRate));
export const gameSettingsVoicePitchAtom = gameSettingsMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.voicePitch));
