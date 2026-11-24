// services, features, and other libraries
import { Array, Context, Effect, Layer, Ref, Schema } from "effect";
import { SqlClient, SqlSchema } from "effect/sql";
import { AddGlobalPulse, AddArcadeRunSummary, AddRunWordEvent } from "@/features/telemetry/domain/models";
import { dieOnDbFailure } from "@/domain/helpers";

// Everything the test layer recorded, so tests can assert the inserts directly.
// Kept private: `TelemetryDBTestRef` still yields a `Ref` of this shape, and the
// type is available structurally without naming it.
interface TelemetryDBTestData {
  readonly globalPulses: ReadonlyArray<AddGlobalPulse>;
  readonly arcadeRunSummaries: ReadonlyArray<AddArcadeRunSummary>;
  readonly runWordEvents: ReadonlyArray<AddRunWordEvent>;
}

// Test-only: the mutable store behind `TelemetryDB.layerTest` (the docs' test-ref
// pattern), exposed so tests can inspect what was written.
export class TelemetryDBTestRef extends Context.Service<TelemetryDBTestRef, Ref.Ref<TelemetryDBTestData>>()("TelemetryDBTestRef") {
  static readonly layer = Layer.effect(
    TelemetryDBTestRef,
    Ref.make<TelemetryDBTestData>({ globalPulses: [], arcadeRunSummaries: [], runWordEvents: [] })
  );
}

export class TelemetryDB extends Context.Service<
  TelemetryDB,
  {
    readonly addGlobalPulse: (request: Array.NonEmptyReadonlyArray<AddGlobalPulse>) => Effect.Effect<void>;
    readonly addArcadeRunSummary: (request: AddArcadeRunSummary) => Effect.Effect<void>;
    readonly addRunWordEvent: (request: AddRunWordEvent) => Effect.Effect<void>;
  }
>()("TelemetryDB") {
  static readonly layer = Layer.effect(
    TelemetryDB,
    Effect.gen(function* () {
      const sql = yield* SqlClient.SqlClient;

      const addGlobalPulse = SqlSchema.void({
        // Non-empty is required by `sql.insert`, which compiles one or more rows
        Request: Schema.NonEmptyArray(AddGlobalPulse),
        execute: (request) =>
          // The conflict target restates the global_pulse primary key declared in
          // seed/migrations/000_init_telemetry.ts — if that PK ever changes, this
          // upsert turns into a failing INSERT
          sql`INSERT INTO global_pulse ${sql.insert(request)} ON CONFLICT (session_id, instance_id, solutions_language, metric_name) DO UPDATE SET metric_payload = EXCLUDED.metric_payload, created_at = NOW()`,
      });

      const addArcadeRunSummary = SqlSchema.void({
        Request: AddArcadeRunSummary,
        execute: (request) => sql`INSERT INTO arcade_run_summary ${sql.insert(request)}`,
      });

      const addRunWordEvent = SqlSchema.void({
        Request: AddRunWordEvent,
        execute: (request) => sql`INSERT INTO run_word_event ${sql.insert(request)}`,
      });

      return TelemetryDB.of({
        addGlobalPulse: (request: Array.NonEmptyReadonlyArray<AddGlobalPulse>) => dieOnDbFailure(addGlobalPulse(request)),
        addArcadeRunSummary: (request: AddArcadeRunSummary) => dieOnDbFailure(addArcadeRunSummary(request)),
        addRunWordEvent: (request: AddRunWordEvent) => dieOnDbFailure(addRunWordEvent(request)),
      });
    })
  );

  // Test-only: records every write into `TelemetryDBTestRef` instead of the
  // database, so tests can assert exactly what was inserted.
  static readonly layerTest = Layer.effect(
    TelemetryDB,
    Effect.gen(function* () {
      const store = yield* TelemetryDBTestRef;

      return TelemetryDB.of({
        addGlobalPulse: Effect.fn("TelemetryDB.addGlobalPulse")(function* (request: Array.NonEmptyReadonlyArray<AddGlobalPulse>) {
          yield* Ref.update(store, (data) => ({ ...data, globalPulses: [...data.globalPulses, ...request] }));
        }),
        addArcadeRunSummary: Effect.fn("TelemetryDB.addArcadeRunSummary")(function* (request: AddArcadeRunSummary) {
          yield* Ref.update(store, (data) => ({ ...data, arcadeRunSummaries: [...data.arcadeRunSummaries, request] }));
        }),
        addRunWordEvent: Effect.fn("TelemetryDB.addRunWordEvent")(function* (request: AddRunWordEvent) {
          yield* Ref.update(store, (data) => ({ ...data, runWordEvents: [...data.runWordEvents, request] }));
        }),
      });
    })
  ).pipe(Layer.provideMerge(TelemetryDBTestRef.layer));
}
