// services, features, and other libraries
import { Effect } from "effect";
import { SqlClient, SqlSchema } from "effect/unstable/sql";
import { AnyCounterArgs, AnyCounterData } from "@/features/telemetry/services/charts-db";

export const anyCounterQuery = (sql: SqlClient.SqlClient) => {
  // C1+C4: single-pass conditional aggregation replaces two scalar CTEs.
  // FILTER computes personal/global in one scan. COALESCE materialises the
  // single scalar row (0, 0) when no rows match — findOne contract (B5)
  // preserved. A7: ::bigint cast retained.
  const query = SqlSchema.findOne({
    Request: AnyCounterArgs,
    Result: AnyCounterData,
    execute: ({ counterName, sessionId, solutionsLanguage }) => sql`
      SELECT
        COALESCE(SUM((metric_payload->>'count')::bigint) FILTER (WHERE session_id = ${sessionId}), 0)::int AS personal,
        COALESCE(SUM((metric_payload->>'count')::bigint), 0)::int AS global
      FROM global_pulse
      WHERE metric_name = ${counterName}
        AND solutions_language = ${solutionsLanguage}`,
  });

  return (request: AnyCounterArgs) =>
    query(request).pipe(
      Effect.tapError(Effect.logError),
      Effect.catchTags({
        SchemaError: Effect.die,
        SqlError: Effect.die,
        NoSuchElementError: Effect.die,
      })
    );
};
