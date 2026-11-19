// services, features, and other libraries
import { Effect, Schema } from "effect";
import { Atom, AtomRegistry } from "effect/reactivity";
import { setupEffect } from "@xstate/effect";
import { gameFlowMachineSendAtom } from "@/features/game/state/game-flow";
import { SolutionsLanguage } from "@/features/game/domain/models";
import { GameSettings } from "./models";

export const setup = setupEffect({
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
});
