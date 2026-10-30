// services, features, and other libraries
import { Array, Context, Effect, Layer, Schema } from "effect";
import { SqlClient, SqlSchema } from "effect/sql";
import { AddGlobalPulse, AddArcadeRunSummary, AddRunWordEvent } from "@/features/telemetry/domain/models";
import { dieOnDbFailure } from "@/domain/db-policy";

export class TelemetryDB extends Context.Service<TelemetryDB>()("TelemetryDB", {
  make: Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient;

    const addGlobalPulse = SqlSchema.void({
      // Non-empty is required by `sql.insert`, which compiles one or more rows
      Request: Schema.NonEmptyArray(AddGlobalPulse),
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
      addGlobalPulse: (request: Array.NonEmptyReadonlyArray<AddGlobalPulse>) => dieOnDbFailure(addGlobalPulse(request)),
      addArcadeRunSummary: (request: AddArcadeRunSummary) => dieOnDbFailure(addArcadeRunSummary(request)),
      addRunWordEvent: (request: AddRunWordEvent) => dieOnDbFailure(addRunWordEvent(request)),
    } as const;
  }),
}) {
  static readonly layer = Layer.effect(this, this.make);
}
