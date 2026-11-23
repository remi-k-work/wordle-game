// services, features, and other libraries
import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";
import { createEffectActor } from "@xstate/effect";
import { sendAndAwait } from "@xstate/effect/test";
import { gameSettingsMachine } from "@/features/settings/machines/game-settings";

// constants
import { INITIAL_GAME_SETTINGS } from "@/features/settings/machines/game-settings/constants";

// The language toggle fans out to the peer machines through atoms; these tests
// cover the machine's own transitions, so the fan-out is recorded instead.
const toggles: string[] = [];

const machine = gameSettingsMachine.provide({
  actions: {
    onSolutionsLanguageToggled: ({ solutionsLanguage }) => Effect.sync(() => void toggles.push(solutionsLanguage)),
  },
});

describe("gameSettingsMachine", () => {
  it.effect("toggles the solutions language and fans out the new one", () =>
    Effect.gen(function* () {
      toggles.length = 0;
      const actor = yield* createEffectActor(machine, { input: INITIAL_GAME_SETTINGS });

      yield* sendAndAwait(actor, { type: "solutionsLanguageToggled" });

      expect(actor.getSnapshot().context.solutionsLanguage).toBe("Pl");
      expect(toggles).toEqual(["Pl"]);
    }).pipe(Effect.scoped)
  );

  it.effect("clamps the voice settings to their ranges", () =>
    Effect.gen(function* () {
      const actor = yield* createEffectActor(machine, { input: INITIAL_GAME_SETTINGS });

      yield* sendAndAwait(actor, { type: "voiceVolumeChanged", voiceVolume: 5 });
      yield* sendAndAwait(actor, { type: "voiceRateChanged", voiceRate: 0 });
      yield* sendAndAwait(actor, { type: "voicePitchChanged", voicePitch: 9 });

      expect(actor.getSnapshot().context).toMatchObject({ voiceVolume: 1, voiceRate: 0.5, voicePitch: 1.5 });
    }).pipe(Effect.scoped)
  );
});
