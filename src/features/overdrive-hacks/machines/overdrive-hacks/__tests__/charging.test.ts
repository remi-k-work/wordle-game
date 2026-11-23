// services, features, and other libraries
import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";
import { createEffectActor, createEffectLogic, waitFor } from "@xstate/effect";
import { sendAndAwait } from "@xstate/effect/test";
import { overdriveHacksMachine } from "@/features/overdrive-hacks/machines/overdrive-hacks";

// types
import type { EffectSourceArgs } from "@xstate/effect";

// Charging the run score is the machine's decision, not the actor's: it spends
// when the actor returns a result and does nothing when the actor yields none.
// A stub EMP actor returns a fixed result, so that decision is observable
// without the actor's atom reads (its domain logic is covered by the
// candidates tests); the `hang` logic keeps the other actors inert.
const charged: string[] = [];

const hang = createEffectLogic((_args: EffectSourceArgs<unknown>) => Effect.never);
const empSucceeds = createEffectLogic((_args: EffectSourceArgs<unknown>) => Effect.succeedSome(["X", "Y", "Z"]));
const empYieldsNone = createEffectLogic((_args: EffectSourceArgs<unknown>) => Effect.succeedNone);

const recordingActions = {
  syncBlockedLetters: () => Effect.void,
  chargeHack: ({ overdriveHackId }: { overdriveHackId: string }) => Effect.sync(() => void charged.push(overdriveHackId)),
  onOverrideHackApplied: () => Effect.void,
  logHackFailure: () => Effect.void,
};

const empSucceedsMachine = overdriveHacksMachine.provide({
  actions: recordingActions,
  actors: { applyEmpHackActor: empSucceeds, applySonarHackActor: hang, applyOverrideHackActor: hang, fetchOverrideAudioActor: hang },
});

const empYieldsNoneMachine = overdriveHacksMachine.provide({
  actions: recordingActions,
  actors: { applyEmpHackActor: empYieldsNone, applySonarHackActor: hang, applyOverrideHackActor: hang, fetchOverrideAudioActor: hang },
});

describe("overdriveHacksMachine hack charging", () => {
  it.effect("charges the run when the hack produces a result", () =>
    Effect.gen(function* () {
      charged.length = 0;
      const actor = yield* createEffectActor(empSucceedsMachine);
      yield* sendAndAwait(actor, { type: "puzzleStarted" });
      yield* sendAndAwait(actor, { type: "hackRequested", overdriveHackId: "emp", runScore: 10_000 });

      yield* waitFor(actor, (current) => current.context.empNukedLetters.length > 0);

      expect(charged).toEqual(["emp"]);
    }).pipe(Effect.scoped)
  );

  it.effect("does not charge the run when the hack yields none", () =>
    Effect.gen(function* () {
      charged.length = 0;
      const actor = yield* createEffectActor(empYieldsNoneMachine);
      yield* sendAndAwait(actor, { type: "puzzleStarted" });
      yield* sendAndAwait(actor, { type: "hackRequested", overdriveHackId: "emp", runScore: 10_000 });

      yield* waitFor(actor, (current) => current.matches({ active: "ready" }));

      expect(actor.getSnapshot().context.empNukedLetters).toEqual([]);
      expect(charged).toEqual([]);
    }).pipe(Effect.scoped)
  );
});
