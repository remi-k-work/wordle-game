// services, features, and other libraries
import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";
import { createEffectActor, createEffectLogic } from "@xstate/effect";
import { sendAndAwait } from "@xstate/effect/test";
import { overdriveHacksMachine } from "@/features/overdrive-hacks/machines/overdrive-hacks";

// types
import type { EffectSourceArgs } from "@xstate/effect";
import type { OverdriveHackId } from "@/features/overdrive-hacks/domain/models";

// constants
import { OVERDRIVE_HACK_COST } from "@/features/overdrive-hacks/domain/constants";

// The hack actors do real RPC work; these tests never let one finish, so a
// never-resolving Effect holds the machine in an applying state on purpose.
// The replacement accepts `unknown` input, so one logic stands in for every
// registered actor while leaving the machine with no Effect requirements.
// `syncBlockedLetters` records into `synced` so the block list sync is observable.
const synced: ReadonlyArray<string>[] = [];

const hang = createEffectLogic((_args: EffectSourceArgs<unknown>) => Effect.never);

const machine = overdriveHacksMachine.provide({
  actions: {
    syncBlockedLetters: ({ blockedLetters }) => Effect.sync(() => void synced.push(blockedLetters)),
    chargeHack: () => Effect.void,
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
  it.effect("clears the keyboard block list when a puzzle ends", () =>
    Effect.gen(function* () {
      synced.length = 0;
      const actor = yield* createEffectActor(machine);

      yield* sendAndAwait(actor, { type: "puzzleStarted" });
      yield* sendAndAwait(actor, { type: "puzzleEnded" });

      expect(synced).toEqual([[]]);
      expect(actor.getSnapshot().matches("idle")).toBe(true);
    }).pipe(Effect.scoped)
  );

  it.effect("clears the keyboard block list when the solutions language changes", () =>
    Effect.gen(function* () {
      synced.length = 0;
      const actor = yield* createEffectActor(machine);

      yield* sendAndAwait(actor, { type: "puzzleStarted" });
      yield* sendAndAwait(actor, { type: "solutionsLanguageChanged" });

      expect(synced).toEqual([[]]);
      expect(actor.getSnapshot().matches("idle")).toBe(true);
    }).pipe(Effect.scoped)
  );

  it.effect("refuses an unaffordable hack", () =>
    Effect.gen(function* () {
      const actor = yield* createEffectActor(machine);
      yield* sendAndAwait(actor, { type: "puzzleStarted" });

      yield* sendAndAwait(actor, { type: "hackRequested", overdriveHackId: "emp", runScore: 0 });
      expect(actor.getSnapshot().matches({ active: "ready" })).toBe(true);
    }).pipe(Effect.scoped)
  );

  it.effect("accepts a hack the run can afford", () =>
    Effect.gen(function* () {
      const actor = yield* createEffectActor(machine);
      yield* sendAndAwait(actor, { type: "puzzleStarted" });

      yield* sendAndAwait(actor, { type: "hackRequested", overdriveHackId: "emp", runScore: OVERDRIVE_HACK_COST("emp") });
      expect(actor.getSnapshot().matches({ active: "applyingEmpHack" })).toBe(true);
    }).pipe(Effect.scoped)
  );

  it.effect("refuses a second hack while one is applying", () =>
    Effect.gen(function* () {
      const actor = yield* createEffectActor(machine);
      yield* sendAndAwait(actor, { type: "puzzleStarted" });

      yield* sendAndAwait(actor, { type: "hackRequested", overdriveHackId: "emp", runScore: 10_000 });
      expect(actor.getSnapshot().matches({ active: "applyingEmpHack" })).toBe(true);

      // No concurrent hacks: a request while applying is ignored
      yield* sendAndAwait(actor, { type: "hackRequested", overdriveHackId: "sonar", runScore: 10_000 });
      expect(actor.getSnapshot().matches({ active: "applyingEmpHack" })).toBe(true);
    }).pipe(Effect.scoped)
  );

  it.effect("rejects an unrecognized hack and stays ready", () =>
    Effect.gen(function* () {
      const actor = yield* createEffectActor(machine);
      yield* sendAndAwait(actor, { type: "puzzleStarted" });

      // An unknown id has no cost, so the affordability guard rejects it before
      // classification; the machine never leaves `ready`
      yield* sendAndAwait(actor, { type: "hackRequested", overdriveHackId: "unknown" as OverdriveHackId, runScore: 10_000 });
      expect(actor.getSnapshot().matches({ active: "ready" })).toBe(true);
    }).pipe(Effect.scoped)
  );
});
