// services, features, and other libraries
import { Context, Effect, Layer, Schema } from "effect";
import { SqlClient, SqlSchema } from "effect/unstable/sql";
import { AddGlobalPulse, AddArcadeRunSummary, AddRunWordEvent } from "@/features/telemetry/domain";
import { PgLive } from "@/lib/pg-live";

export class TelemetryDB extends Context.Service<TelemetryDB>()("TelemetryDB", {
  make: Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient;

    const addGlobalPulse = SqlSchema.void({
      Request: Schema.Array(AddGlobalPulse),
      execute: (request) =>
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

    return {
      addGlobalPulse: (request: ReadonlyArray<AddGlobalPulse>) =>
        addGlobalPulse(request).pipe(Effect.tapError(Effect.logError), Effect.catchTags({ SchemaError: Effect.die, SqlError: Effect.die })),
      addArcadeRunSummary: (request: AddArcadeRunSummary) =>
        addArcadeRunSummary(request).pipe(Effect.tapError(Effect.logError), Effect.catchTags({ SchemaError: Effect.die, SqlError: Effect.die })),
      addRunWordEvent: (request: AddRunWordEvent) =>
        addRunWordEvent(request).pipe(Effect.tapError(Effect.logError), Effect.catchTags({ SchemaError: Effect.die, SqlError: Effect.die })),
    } as const;
  }),
}) {
  static readonly layer = Layer.effect(this, this.make).pipe(Layer.provide(PgLive));
}
