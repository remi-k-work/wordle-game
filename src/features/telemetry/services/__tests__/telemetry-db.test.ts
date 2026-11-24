// services, features, and other libraries
import { describe, expect, it } from "@effect/vitest";
import { Effect, Ref } from "effect";
import { TelemetryDB, TelemetryDBTestRef } from "@/features/telemetry/services/telemetry-db";
import { AddArcadeRunSummary, AddGlobalPulse, AddRunWordEvent } from "@/features/telemetry/domain/models";

// The in-memory layer only has to record what the handler passes it; these tests
// pin that each method appends the request (not a re-derived copy) so callers can
// assert on exactly what would have hit the database.

const SESSION_ID = "3f2504e0-4f89-41d3-9a0c-0305e82c3301";
const RUN_ID = "550e8400-e29b-41d4-a716-446655440000";

const pulse = (metricName: string) =>
  new AddGlobalPulse({ sessionId: SESSION_ID, instanceId: RUN_ID, solutionsLanguage: "En", metricName, metricPayload: { by: "test" } });

const arcadeRunSummary = new AddArcadeRunSummary({
  runId: RUN_ID,
  sessionId: SESSION_ID,
  solutionsLanguage: "En",
  deathReason: "Guesses",
  failedOnWord: "APPLE",
  finalScore: 1234,
  finalStreak: 3,
  durationSeconds: 90,
});

const runWordEvent = new AddRunWordEvent({
  runId: RUN_ID,
  solutionsLanguage: "En",
  theSecretWord: "APPLE",
  guessedTurn: 3,
  timeSeconds: 42,
});

describe("TelemetryDB.layerTest", () => {
  it.effect("records each write into the test ref", () =>
    Effect.gen(function* () {
      const db = yield* TelemetryDB;

      yield* db.addGlobalPulse([pulse("runStarted")]);
      yield* db.addArcadeRunSummary(arcadeRunSummary);
      yield* db.addRunWordEvent(runWordEvent);

      const store = yield* TelemetryDBTestRef;
      const recorded = yield* Ref.get(store);

      expect(recorded.globalPulses).toStrictEqual([pulse("runStarted")]);
      expect(recorded.arcadeRunSummaries).toStrictEqual([arcadeRunSummary]);
      expect(recorded.runWordEvents).toStrictEqual([runWordEvent]);
    }).pipe(Effect.provide(TelemetryDB.layerTest))
  );

  it.effect("appends a batch of global pulses in order", () =>
    Effect.gen(function* () {
      const db = yield* TelemetryDB;

      yield* db.addGlobalPulse([pulse("first"), pulse("second")]);

      const store = yield* TelemetryDBTestRef;
      const recorded = yield* Ref.get(store);

      expect(recorded.globalPulses).toStrictEqual([pulse("first"), pulse("second")]);
    }).pipe(Effect.provide(TelemetryDB.layerTest))
  );
});
