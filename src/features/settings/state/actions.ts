// services, features, and other libraries
import { Effect } from "effect";
import { Atom } from "@effect-atom/atom-react";
import { changeSolutionsLanguage, changeVoicePitch, changeVoiceRate, changeVoiceVoice, changeVoiceVolume } from "@/features/settings/domain";
import { gameSettingsAtom } from ".";

// types
import type { VoicePitch, VoiceRate, VoiceVoice, VoiceVolume } from "@/features/settings/domain";

// To change and manage game settings
export const changeSolutionsLanguageAction = Atom.fn(
  Effect.fnUntraced(function* (_: void, get: Atom.FnContext) {
    get.set(gameSettingsAtom, changeSolutionsLanguage(get(gameSettingsAtom)));
  })
);

// The voice related settings
export const changeVoiceVoiceAction = Atom.fn(
  Effect.fnUntraced(function* (newVoiceVoice: VoiceVoice, get: Atom.FnContext) {
    get.set(gameSettingsAtom, changeVoiceVoice(get(gameSettingsAtom), newVoiceVoice));
  })
);
export const changeVoiceVolumeAction = Atom.fn(
  Effect.fnUntraced(function* (newVoiceVolume: VoiceVolume, get: Atom.FnContext) {
    get.set(gameSettingsAtom, changeVoiceVolume(get(gameSettingsAtom), newVoiceVolume));
  })
);
export const changeVoiceRateAction = Atom.fn(
  Effect.fnUntraced(function* (newVoiceRate: VoiceRate, get: Atom.FnContext) {
    get.set(gameSettingsAtom, changeVoiceRate(get(gameSettingsAtom), newVoiceRate));
  })
);
export const changeVoicePitchAction = Atom.fn(
  Effect.fnUntraced(function* (newVoicePitch: VoicePitch, get: Atom.FnContext) {
    get.set(gameSettingsAtom, changeVoicePitch(get(gameSettingsAtom), newVoicePitch));
  })
);
