// services, features, and other libraries
import { Effect } from "effect";
import { Atom } from "effect/unstable/reactivity";
import { RuntimeClient } from "@/lib/runtime-client";
import { setup, assign, assertEvent } from "xstate";
import { gameDataMachineAtom, runSessionMachineAtom } from "@/features/game/state";

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

    solutionsLanguageChanged: () => {
      RuntimeClient.runPromise(
        Effect.gen(function* () {
          // Forfeit the active run
          yield* Atom.set(runSessionMachineAtom, { type: "forfeitedRun" });

          // Notify the game data machine to reload solutions/dictionary when solutions language changes
          yield* Atom.set(gameDataMachineAtom, { type: "solutionsLanguageChanged" });

          // Start a brand-new arcade run
          yield* Atom.set(runSessionMachineAtom, { type: "startedNewRun" });
        })
      );
    },
  },
}).createMachine({
  id: "gameSettings",
  context: ({ input }) => ({ ...input }) as const satisfies GameSettings,
  initial: "active",

  states: {
    active: {
      on: {
        solutionsLanguageToggled: { actions: ["toggleSolutionsLanguage", "solutionsLanguageChanged"] },
        voiceVoiceChanged: { actions: "changeVoiceVoice" },
        voiceVolumeChanged: { actions: "changeVoiceVolume" },
        voiceRateChanged: { actions: "changeVoiceRate" },
        voicePitchChanged: { actions: "changeVoicePitch" },
      },
    },
  },
});
