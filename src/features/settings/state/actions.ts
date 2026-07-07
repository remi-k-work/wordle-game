// services, features, and other libraries
import { Effect } from "effect";
import { Atom } from "effect/unstable/reactivity";
import { changeSolutionsLanguage, changeVoicePitch, changeVoiceRate, changeVoiceVoice, changeVoiceVolume, GameSettings } from "@/features/settings/domain";
import { gameSettingsAtom } from ".";
import { gameDataMachineAtom } from "@/features/game/state";

// To change and manage game settings
export const changeSolutionsLanguageAction = Atom.fn(
  Effect.fnUntraced(function* (_: void, get: Atom.FnContext) {
    get.set(gameSettingsAtom, changeSolutionsLanguage(get(gameSettingsAtom)));
    get.set(gameDataMachineAtom, { type: "solutionsLanguageChanged" });
  })
);

// The voice related settings
export const changeVoiceVoiceAction = Atom.fn(
  Effect.fnUntraced(function* (newVoiceVoice: GameSettings["voiceVoice"], get: Atom.FnContext) {
    get.set(gameSettingsAtom, changeVoiceVoice(get(gameSettingsAtom), newVoiceVoice));
  })
);
export const changeVoiceVolumeAction = Atom.fn(
  Effect.fnUntraced(function* (newVoiceVolume: GameSettings["voiceVolume"], get: Atom.FnContext) {
    get.set(gameSettingsAtom, changeVoiceVolume(get(gameSettingsAtom), newVoiceVolume));
  })
);
export const changeVoiceRateAction = Atom.fn(
  Effect.fnUntraced(function* (newVoiceRate: GameSettings["voiceRate"], get: Atom.FnContext) {
    get.set(gameSettingsAtom, changeVoiceRate(get(gameSettingsAtom), newVoiceRate));
  })
);
export const changeVoicePitchAction = Atom.fn(
  Effect.fnUntraced(function* (newVoicePitch: GameSettings["voicePitch"], get: Atom.FnContext) {
    get.set(gameSettingsAtom, changeVoicePitch(get(gameSettingsAtom), newVoicePitch));
  })
);
