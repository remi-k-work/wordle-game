// services, features, and other libraries
import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";
import { createEffectActor } from "@xstate/effect";
import { sendAndAwait } from "@xstate/effect/test";
import { gameFlowMachine } from "@/features/game/machines/game-flow";

// The flow's actions fan out to the other feature machines through shared atoms.
// These tests cover the flow's own transitions, so those side effects are stubbed
// rather than standing up the whole atom + RPC runtime.
const machine = gameFlowMachine.provide({
  actions: {
    startNewRun: () => Effect.void,
    requestNextWord: () => Effect.void,
    forfeitRun: () => Effect.void,
    bankWonWord: () => Effect.void,
    finishLostRun: () => Effect.void,
    changeLanguage: () => Effect.void,
  },
});

describe("gameFlowMachine", () => {
  // Regression: the root-level solutionsLanguageChanged handler used a bare
  // `target: "ready"`. A target on the root resolves against the root's children,
  // so a bare key throws E13 and the transition never happens — the game stayed
  // stuck in its current state instead of restarting for the new language.
  it.effect("returns to ready when the solutions language changes mid-run", () =>
    Effect.gen(function* () {
      const actor = yield* createEffectActor(machine, { input: { hasActiveRun: false } });

      // ready -> starting -> playing
      yield* sendAndAwait(actor, { type: "newRunStarted" });
      expect(actor.getSnapshot().matches("playing")).toBe(true);

      yield* sendAndAwait(actor, { type: "solutionsLanguageChanged", solutionsLanguage: "En" });
      expect(actor.getSnapshot().matches("ready")).toBe(true);
    }).pipe(Effect.scoped)
  );

  it.effect("returns to ready when the solutions language changes between words", () =>
    Effect.gen(function* () {
      const actor = yield* createEffectActor(machine, { input: { hasActiveRun: true } });

      // classifying -> betweenWords (the initial snapshot is resolved immediately)
      expect(actor.getSnapshot().matches("betweenWords")).toBe(true);

      yield* sendAndAwait(actor, { type: "solutionsLanguageChanged", solutionsLanguage: "Pl" });
      expect(actor.getSnapshot().matches("ready")).toBe(true);
    }).pipe(Effect.scoped)
  );
});
