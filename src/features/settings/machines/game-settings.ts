// services, features, and other libraries
import { Atom } from "effect/reactivity";
import { runClientCommand } from "@/lib/runtime-client";
import { setup, assign, assertEvent } from "xstate";
import { gameFlowMachineAtom } from "@/features/game/state/game-flow";
import { otherSolutionsLanguage } from "@/features/game/domain/helpers";

// types
import type { GameSettings } from "@/features/settings/domain/models";

export const gameSettingsMachine = setup({
  types: {} as {
    events:
      | { readonly type: "solutionsLanguageToggled" }
      | { readonly type: "voiceVoiceChanged"; readonly voiceVoice: GameSettings["voiceVoice"] }
      | { readonly type: "voiceVolumeChanged"; readonly voiceVolume: GameSettings["voiceVolume"] }
      | { readonly type: "voiceRateChanged"; readonly voiceRate: GameSettings["voiceRate"] }
      | { readonly type: "voicePitchChanged"; readonly voicePitch: GameSettings["voicePitch"] };
    context: GameSettings;
    input: GameSettings;
  },
  actions: {
    // Toggle the solutions language (the language rule itself lives in the
    // game domain, shared with every other place that switches language)
    toggleSolutionsLanguage: assign({
      solutionsLanguage: ({ context }) => otherSolutionsLanguage(context.solutionsLanguage),
    }),

    // The voice related settings
    changeVoiceVoice: assign({
      voiceVoice: ({ event }) => {
        assertEvent(event, "voiceVoiceChanged");
        return event.voiceVoice;
      },
    }),
    changeVoiceVolume: assign({
      voiceVolume: ({ event }) => {
        assertEvent(event, "voiceVolumeChanged");
        return event.voiceVolume;
      },
    }),
    changeVoiceRate: assign({
      voiceRate: ({ event }) => {
        assertEvent(event, "voiceRateChanged");
        return event.voiceRate;
      },
    }),
    changeVoicePitch: assign({
      voicePitch: ({ event }) => {
        assertEvent(event, "voicePitchChanged");
        return event.voicePitch;
      },
    }),

    // Notify all the other machines about the solutions language change. The
    // actions run in declaration order, so the notification carries the
    // ALREADY-TOGGLED value (the language the app is switching to)
    onSolutionsLanguageToggled: ({ context }) =>
      runClientCommand(Atom.set(gameFlowMachineAtom, { type: "language.changed", solutionsLanguage: context.solutionsLanguage })),
  },
}).createMachine({
  id: "gameSettings",
  context: ({ input }) => ({ ...input }) satisfies GameSettings,
  // A single "active" state: the machine never branches, it exists to own the
  // settings context with the snapshot/persistence plumbing createMachineAtom
  // provides — a reducer in machine clothing, deliberately
  initial: "active",

  states: {
    active: {
      on: {
        solutionsLanguageToggled: { actions: ["toggleSolutionsLanguage", "onSolutionsLanguageToggled"] },
        voiceVoiceChanged: { actions: "changeVoiceVoice" },
        voiceVolumeChanged: { actions: "changeVoiceVolume" },
        voiceRateChanged: { actions: "changeVoiceRate" },
        voicePitchChanged: { actions: "changeVoicePitch" },
      },
    },
  },
});
