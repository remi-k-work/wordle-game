// services, features, and other libraries
import { Atom } from "effect/unstable/reactivity";
import { runClientCommand } from "@/lib/runtime-client";
import { setup, assign, assertEvent } from "xstate";
import { gameFlowMachineAtom } from "@/features/game/state";

// types
import type { GameSettings } from "@/features/settings/domain";

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
    // Toggle the solutions language
    toggleSolutionsLanguage: assign({ solutionsLanguage: ({ context }) => (context.solutionsLanguage === "En" ? "Pl" : "En") }),

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

    // Notify all the other machines about the solutions language change
    onSolutionsLanguageToggled: ({ context }) =>
      runClientCommand(Atom.set(gameFlowMachineAtom, { type: "language.changed", solutionsLanguage: context.solutionsLanguage })),
  },
}).createMachine({
  id: "gameSettings",
  context: ({ input }) => ({ ...input }) as const satisfies GameSettings,
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
