// services, features, and other libraries
import { Equal } from "effect";
import { Atom } from "effect/reactivity";
import { createActorAtoms } from "@xstate/effect/atom";
import { RuntimeAtom } from "@/lib/runtime-client";
import { GameSettings } from "@/features/settings/machines/game-settings/models";
import { gameSettingsMachine } from "@/features/settings/machines/game-settings";
import { createMachineState } from "@/lib/machine-atoms";

// constants
import { INITIAL_GAME_SETTINGS } from "@/features/settings/machines/game-settings/constants";

// Persistent storage for game settings
const gameSettingsAtom = Atom.kvs({
  runtime: RuntimeAtom,
  key: "@wordle/gameSettings",
  schema: GameSettings,
  defaultValue: () => INITIAL_GAME_SETTINGS,
}).pipe(Atom.keepAlive);

const gameSettingsMachineBag = Atom.make((get) => createActorAtoms(RuntimeAtom, gameSettingsMachine, { input: get.once(gameSettingsAtom) })).pipe(
  Atom.keepAlive
);
export const { snapshot: gameSettingsMachineAtom, send: gameSettingsMachineSendAtom } = createMachineState(gameSettingsMachine, gameSettingsMachineBag, {
  onSnapshot: (get, snapshot) => {
    if (!Equal.equals(get.once(gameSettingsAtom), snapshot.context)) get.set(gameSettingsAtom, snapshot.context);
  },
});

// Specialized selectors for granular state access and optimized re-renders
export const gameSettingsSolutionsLanguageAtom = gameSettingsMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.solutionsLanguage));
export const gameSettingsVoiceAtom = gameSettingsMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.voiceVoice));
export const gameSettingsVoiceVolumeAtom = gameSettingsMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.voiceVolume));
export const gameSettingsVoiceRateAtom = gameSettingsMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.voiceRate));
export const gameSettingsVoicePitchAtom = gameSettingsMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.voicePitch));
