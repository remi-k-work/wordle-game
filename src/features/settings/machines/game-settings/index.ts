// services, features, and other libraries
import { Number } from "effect";
import { setup } from "./setup";
import { otherSolutionsLanguage } from "@/features/game/domain/helpers";

// types
import type { GameSettings } from "./models";

// constants
import { VOICE_PITCH_RANGE, VOICE_RATE_RANGE, VOICE_VOLUME_RANGE } from "@/features/settings/domain/constants";

export const gameSettingsMachine = setup.createMachine({
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
