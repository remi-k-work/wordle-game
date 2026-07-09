// services, features, and other libraries
import { Struct } from "effect";
import { Atom } from "effect/unstable/reactivity";
import { createActor } from "xstate";
import { RuntimeAtom } from "@/lib/runtime-client";
import { GameSettings } from "@/features/settings/domain";
import { gameSettingsMachine } from "@/features/settings/machines/game-settings";
import { inspect } from "@/features/game/state";

// types
import type { Actor, EventFromLogic, SnapshotFrom } from "xstate";

type GameSettingsMachineSnapshot = SnapshotFrom<typeof gameSettingsMachine>;
type GameSettingsMachineEvent = EventFromLogic<typeof gameSettingsMachine>;
type GameSettingsMachineActor = Actor<typeof gameSettingsMachine>;

// constants
import { INITIAL_GAME_SETTINGS } from "@/features/settings/domain";

// Persistent storage for game settings
const gameSettingsAtom = Atom.kvs({
  runtime: RuntimeAtom,
  key: "@wordle/gameSettings",
  schema: GameSettings.mapFields(Struct.pick(["solutionsLanguage", "voiceVoice", "voiceVolume", "voiceRate", "voicePitch"])),
  defaultValue: () => INITIAL_GAME_SETTINGS,
}).pipe(Atom.keepAlive);

// Creates an Atom-owned XState actor reference
const gameSettingsMachineActorAtom = Atom.make<GameSettingsMachineActor>((get) => {
  // Read persisted state from storage
  const persistedState = get.once(gameSettingsAtom);

  const actor = createActor(gameSettingsMachine, { input: persistedState, inspect });
  actor.start();

  get.addFinalizer(() => {
    actor.stop();
  });

  return actor;
}).pipe(Atom.keepAlive);

// The game settings machine is now a living actor inside the effect atom
export const gameSettingsMachineAtom = Atom.writable<GameSettingsMachineSnapshot, GameSettingsMachineEvent>(
  (get) => {
    const actor = get(gameSettingsMachineActorAtom);
    const subscription = actor.subscribe((snapshot) => {
      get.setSelf(snapshot);

      // Save back to local storage
      get.set(gameSettingsAtom, snapshot.context);
    });

    get.addFinalizer(() => {
      subscription.unsubscribe();
    });

    return actor.getSnapshot();
  },
  (ctx, event) => {
    ctx.get(gameSettingsMachineActorAtom).send(event);
  }
).pipe(Atom.keepAlive);

// Specialized selectors for granular state access and optimized re-renders
export const gameSettingsSolutionsLanguageAtom = gameSettingsMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.solutionsLanguage));
export const gameSettingsVoiceVoiceAtom = gameSettingsMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.voiceVoice));
export const gameSettingsVoiceVolumeAtom = gameSettingsMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.voiceVolume));
export const gameSettingsVoiceRateAtom = gameSettingsMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.voiceRate));
export const gameSettingsVoicePitchAtom = gameSettingsMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.voicePitch));
