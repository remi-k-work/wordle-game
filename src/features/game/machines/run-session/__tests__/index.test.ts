// services, features, and other libraries
import { describe, expect, it } from "@effect/vitest";
import { DateTime, Effect, Option } from "effect";
import { createEffectActor } from "@xstate/effect";
import { sendAndAwait } from "@xstate/effect/test";
import { runSessionMachine } from "@/features/game/machines/run-session";
import { INITIAL_RUN_SESSION } from "@/features/game/machines/run-session/constants";
import { INITIAL_WORD_CHALLENGE } from "@/features/game/machines/word-challenge/constants";

// The run session's actions fan out to the other feature machines through shared
// atoms. These tests cover the run session's own transitions, so those side
// effects are stubbed rather than standing up the whole atom + RPC runtime.
const machine = runSessionMachine.provide({
  actions: {
    clearFinishedRun: () => Effect.void,
    trackStartedNewRun: () => Effect.void,
    saveFinishedRun: () => Effect.void,
    trackForfeitedRun: () => Effect.void,
    onRunFinished: () => Effect.void,
    requestNextWord: () => Effect.void,
    endPuzzle: () => Effect.void,
    forfeitRun: () => Effect.void,
  },
});

const RUN_ID = "00000000-0000-4000-8000-000000000000";

const activeRun = {
  ...INITIAL_RUN_SESSION,
  runId: Option.some(RUN_ID),
  createdAt: Option.some(DateTime.makeUnsafe(0)),
};

const wordScore = { wordScore: 800, basePointsPerTurn: 200, speedMultiplier: 1, timeSeconds: 3 };

describe("runSessionMachine", () => {
  it.effect("restores a persisted active run between words", () =>
    Effect.gen(function* () {
      const actor = yield* createEffectActor(machine, { input: activeRun });
      expect(actor.getSnapshot().matches({ active: "betweenWords" })).toBe(true);
    }).pipe(Effect.scoped)
  );

  it.effect("classifies a session without a run id as inactive", () =>
    Effect.gen(function* () {
      const actor = yield* createEffectActor(machine, { input: INITIAL_RUN_SESSION });
      expect(actor.getSnapshot().matches("inactive")).toBe(true);
    }).pipe(Effect.scoped)
  );

  it.effect("starts a new run and requests the first word", () =>
    Effect.gen(function* () {
      const actor = yield* createEffectActor(machine, { input: INITIAL_RUN_SESSION });

      yield* sendAndAwait(actor, { type: "newRunStarted" });
      const snapshot = actor.getSnapshot();
      expect(snapshot.matches({ active: "playing" })).toBe(true);
      expect(Option.isSome(snapshot.context.runId)).toBe(true);
    }).pipe(Effect.scoped)
  );

  it.effect("only accepts nextWordRequested between words", () =>
    Effect.gen(function* () {
      const actor = yield* createEffectActor(machine, { input: activeRun });

      // between words -> a word is now in progress
      yield* sendAndAwait(actor, { type: "nextWordRequested" });
      expect(actor.getSnapshot().matches({ active: "playing" })).toBe(true);

      // a second request while a word is in progress is impossible and ignored
      yield* sendAndAwait(actor, { type: "nextWordRequested" });
      expect(actor.getSnapshot().matches({ active: "playing" })).toBe(true);
    }).pipe(Effect.scoped)
  );

  it.effect("banks a won word and waits between words", () =>
    Effect.gen(function* () {
      const actor = yield* createEffectActor(machine, { input: { ...activeRun, runScore: 100, streak: 2 } });
      yield* sendAndAwait(actor, { type: "nextWordRequested" });

      yield* sendAndAwait(actor, { type: "wordWon", wordScore });
      const snapshot = actor.getSnapshot();
      expect(snapshot.matches({ active: "betweenWords" })).toBe(true);
      expect(snapshot.context.runScore).toBe(900);
      expect(snapshot.context.streak).toBe(3);
    }).pipe(Effect.scoped)
  );

  it.effect("ends the run on a lost word", () =>
    Effect.gen(function* () {
      const actor = yield* createEffectActor(machine, { input: activeRun });
      yield* sendAndAwait(actor, { type: "nextWordRequested" });

      yield* sendAndAwait(actor, { type: "wordLost" });
      expect(actor.getSnapshot().matches("inactive")).toBe(true);
    }).pipe(Effect.scoped)
  );

  it.effect("forfeits the active run", () =>
    Effect.gen(function* () {
      const actor = yield* createEffectActor(machine, { input: activeRun });
      yield* sendAndAwait(actor, { type: "nextWordRequested" });

      yield* sendAndAwait(actor, { type: "runForfeited", wordChallenge: INITIAL_WORD_CHALLENGE() });
      expect(actor.getSnapshot().matches("inactive")).toBe(true);
    }).pipe(Effect.scoped)
  );

  it.effect("abandons the active run when the solutions language changes", () =>
    Effect.gen(function* () {
      const actor = yield* createEffectActor(machine, { input: activeRun });
      yield* sendAndAwait(actor, { type: "nextWordRequested" });

      yield* sendAndAwait(actor, { type: "solutionsLanguageChanged" });
      expect(actor.getSnapshot().matches("inactive")).toBe(true);
    }).pipe(Effect.scoped)
  );

  it.effect("charges a hack that completes between words", () =>
    Effect.gen(function* () {
      const actor = yield* createEffectActor(machine, { input: { ...activeRun, runScore: 500 } });

      // The word ended while the hack was applying: the run still owns the charge
      yield* sendAndAwait(actor, { type: "runScoreSpent", amount: 120 });
      expect(actor.getSnapshot().context.runScore).toBe(380);

      // In progress charges behave the same
      yield* sendAndAwait(actor, { type: "nextWordRequested" });
      yield* sendAndAwait(actor, { type: "runScoreSpent", amount: 120 });
      expect(actor.getSnapshot().context.runScore).toBe(260);
    }).pipe(Effect.scoped)
  );

  it.effect("ignores a charge when no run is active", () =>
    Effect.gen(function* () {
      const actor = yield* createEffectActor(machine, { input: { ...INITIAL_RUN_SESSION, runScore: 500 } });

      yield* sendAndAwait(actor, { type: "runScoreSpent", amount: 120 });

      expect(actor.getSnapshot().matches("inactive")).toBe(true);
      expect(actor.getSnapshot().context.runScore).toBe(500);
    }).pipe(Effect.scoped)
  );
});
