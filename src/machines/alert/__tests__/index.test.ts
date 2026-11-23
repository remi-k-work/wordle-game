// services, features, and other libraries
import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";
import { createEffectActor, createEffectLogic, waitFor } from "@xstate/effect";
import { sendAndAwait } from "@xstate/effect/test";
import { alertMachine } from "@/machines/alert";

// types
import type { EffectSourceArgs } from "@xstate/effect";

// The confirm callback is supplied by the caller; these tests record that it
// ran and use a hanging actor where the mid-flight `submitting` state matters.
const ran: string[] = [];

const recordingMachine = alertMachine.provide({
  actions: { logFailure: () => Effect.sync(() => void ran.push("failed")) },
});

const hangingMachine = alertMachine.provide({
  actions: { logFailure: () => Effect.void },
  actors: { runOkayedActor: createEffectLogic((_args: EffectSourceArgs<unknown>) => Effect.never) },
});

describe("alertMachine", () => {
  it.effect("opens the forfeit-run alert and cancels back to closed", () =>
    Effect.gen(function* () {
      const actor = yield* createEffectActor(recordingMachine);

      yield* sendAndAwait(actor, { type: "opened", alertType: "forfeit-run" });
      expect(actor.getSnapshot().matches("forfeit-run")).toBe(true);

      yield* sendAndAwait(actor, { type: "cancelled" });
      expect(actor.getSnapshot().matches("closed")).toBe(true);
    }).pipe(Effect.scoped)
  );

  it.effect("stays in submitting while the confirm callback is in flight", () =>
    Effect.gen(function* () {
      const actor = yield* createEffectActor(hangingMachine);

      yield* sendAndAwait(actor, { type: "opened", alertType: "forfeit-run" });
      yield* sendAndAwait(actor, { type: "okayed", onOkayed: () => undefined });

      expect(actor.getSnapshot().matches("submitting")).toBe(true);
    }).pipe(Effect.scoped)
  );

  it.effect("runs the callback and closes once it settles", () =>
    Effect.gen(function* () {
      ran.length = 0;
      const actor = yield* createEffectActor(recordingMachine);

      yield* sendAndAwait(actor, { type: "opened", alertType: "forfeit-run" });
      yield* sendAndAwait(actor, { type: "okayed", onOkayed: () => void ran.push("okayed") });
      yield* waitFor(actor, (current) => current.matches("closed"));

      expect(ran).toEqual(["okayed"]);
    }).pipe(Effect.scoped)
  );

  it.effect("logs the failure and closes when the callback rejects", () =>
    Effect.gen(function* () {
      ran.length = 0;
      const actor = yield* createEffectActor(recordingMachine);

      yield* sendAndAwait(actor, { type: "opened", alertType: "forfeit-run" });
      yield* sendAndAwait(actor, { type: "okayed", onOkayed: () => Promise.reject(new Error("boom")) });
      yield* waitFor(actor, (current) => current.matches("closed") && ran.includes("failed"));

      expect(ran).toEqual(["failed"]);
    }).pipe(Effect.scoped)
  );
});
