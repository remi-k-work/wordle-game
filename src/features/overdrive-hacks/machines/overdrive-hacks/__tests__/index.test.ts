// services, features, and other libraries
import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";
import { createEffectActor, createEffectLogic } from "@xstate/effect";
import { sendAndAwait } from "@xstate/effect/test";
import { overdriveHacksMachine } from "@/features/overdrive-hacks/machines/overdrive-hacks";

// types
import type { EffectSourceArgs } from "@xstate/effect";
import type { OverdriveHackId } from "@/features/overdrive-hacks/domain/models";

// The hack actors do real RPC work; these tests never let one finish, so a
// never-resolving Effect holds the machine in an applying state on purpose.
// The replacement accepts `unknown` input, so one logic stands in for every
// registered actor while leaving the machine with no Effect requirements.
// `forwardKeyPress` records into `forwarded` so the forwarding is observable.
const forwarded: string[] = [];

const hang = createEffectLogic((_args: EffectSourceArgs<unknown>) => Effect.never);

const machine = overdriveHacksMachine.provide({
  actions: {
    forwardKeyPress: ({ pressedKey }) => Effect.sync(() => void forwarded.push(pressedKey)),
    onOverrideHackApplied: () => Effect.void,
    logHackFailure: () => Effect.void,
  },
  actors: {
    applyEmpHackActor: hang,
    applySonarHackActor: hang,
    applyOverrideHackActor: hang,
    fetchOverrideAudioActor: hang,
  },
});

describe("overdriveHacksMachine", () => {
  it.effect("forwards key presses only while a puzzle is active", () =>
    Effect.gen(function* () {
      forwarded.length = 0;
      const actor = yield* createEffectActor(machine);

      // Idle: a physical key press goes nowhere
      yield* sendAndAwait(actor, { type: "keyPressed", pressedKey: "a" });
      expect(forwarded).toEqual([]);
      expect(actor.getSnapshot().matches("idle")).toBe(true);

      // Active: the key press reaches the word challenge
      yield* sendAndAwait(actor, { type: "puzzleStarted" });
      yield* sendAndAwait(actor, { type: "keyPressed", pressedKey: "b" });
      expect(forwarded).toEqual(["b"]);
    }).pipe(Effect.scoped)
  );

  it.effect("keeps forwarding keys while a hack applies, and refuses a second hack", () =>
    Effect.gen(function* () {
      forwarded.length = 0;
      const actor = yield* createEffectActor(machine);
      yield* sendAndAwait(actor, { type: "puzzleStarted" });

      yield* sendAndAwait(actor, { type: "hackRequested", overdriveHackId: "emp" });
      expect(actor.getSnapshot().matches({ active: "applyingEmpHack" })).toBe(true);

      // The hoisted handler still forwards physical input mid-hack
      yield* sendAndAwait(actor, { type: "keyPressed", pressedKey: "c" });
      expect(forwarded).toEqual(["c"]);

      // No concurrent hacks: a request while applying is ignored
      yield* sendAndAwait(actor, { type: "hackRequested", overdriveHackId: "sonar" });
      expect(actor.getSnapshot().matches({ active: "applyingEmpHack" })).toBe(true);
    }).pipe(Effect.scoped)
  );

  it.effect("falls back to ready when the requested hack is unrecognized", () =>
    Effect.gen(function* () {
      const actor = yield* createEffectActor(machine);
      yield* sendAndAwait(actor, { type: "puzzleStarted" });

      yield* sendAndAwait(actor, { type: "hackRequested", overdriveHackId: "unknown" as OverdriveHackId });
      expect(actor.getSnapshot().matches({ active: "ready" })).toBe(true);
    }).pipe(Effect.scoped)
  );
});
