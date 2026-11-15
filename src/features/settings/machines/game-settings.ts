// services, features, and other libraries
import { Effect, Number, Schema } from "effect";
import { Atom, AtomRegistry } from "effect/reactivity";
import { setupEffect } from "@xstate/effect";
import { gameFlowMachineSendAtom } from "@/features/game/state/game-flow";
import { otherSolutionsLanguage } from "@/features/game/domain/helpers";
import { GameSettings } from "@/features/settings/domain/models";
import { SolutionsLanguage } from "@/features/game/domain/models";

// constants
import { VOICE_PITCH_RANGE, VOICE_RATE_RANGE, VOICE_VOLUME_RANGE } from "@/features/settings/domain/constants";

export const gameSettingsMachine = setupEffect({
  schemas: {
    context: GameSettings,
    input: GameSettings,
    events: {
      solutionsLanguageToggled: Schema.Struct({}),
      voiceVoiceChanged: Schema.Struct({ voiceVoice: GameSettings.fields.voiceVoice }),
      voiceVolumeChanged: Schema.Struct({ voiceVolume: GameSettings.fields.voiceVolume }),
      voiceRateChanged: Schema.Struct({ voiceRate: GameSettings.fields.voiceRate }),
      voicePitchChanged: Schema.Struct({ voicePitch: GameSettings.fields.voicePitch }),
    },
    actions: { onSolutionsLanguageToggled: { params: Schema.Struct({ solutionsLanguage: SolutionsLanguage }) } },
  },
  actions: {
    // Notify all the other machines about the solutions language change
    onSolutionsLanguageToggled: ({ solutionsLanguage }): Effect.Effect<void, never, AtomRegistry.AtomRegistry> =>
      Atom.set(gameFlowMachineSendAtom, { type: "language.changed", solutionsLanguage }),
  },
}).createMachine({
  id: "gameSettings",
  context: ({ input }) => ({ ...input }) satisfies GameSettings,
  initial: "active",

  states: {
    active: {
      on: {
        solutionsLanguageToggled: (args, enq) => {
          const solutionsLanguage = otherSolutionsLanguage(args.context.solutionsLanguage);
          enq(args.actions.onSolutionsLanguageToggled, { self: args.self, solutionsLanguage });
          return { context: { ...args.context, solutionsLanguage } };
        },

        voiceVoiceChanged: { context: ({ context, event }) => ({ ...context, voiceVoice: event.voiceVoice }) },
        voiceVolumeChanged: { context: ({ context, event }) => ({ ...context, voiceVolume: Number.clamp(VOICE_VOLUME_RANGE)(event.voiceVolume) }) },
        voiceRateChanged: { context: ({ context, event }) => ({ ...context, voiceRate: Number.clamp(VOICE_RATE_RANGE)(event.voiceRate) }) },
        voicePitchChanged: { context: ({ context, event }) => ({ ...context, voicePitch: Number.clamp(VOICE_PITCH_RANGE)(event.voicePitch) }) },
      },
    },
  },
});
