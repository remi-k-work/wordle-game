// services, features, and other libraries
import { Effect } from "effect";
import { Schema } from "effect";
import { SqlClient, SqlSchema } from "effect/unstable/sql";
import { AnyChartArgs } from "@/features/telemetry/services/charts-db";

// Factory backing openingGuesses + failedWords. Both queries are identical
// except for metricName and Result schema (passed per call-site).
// C1: single-pass conditional aggregation replaces two-CTE FULL OUTER JOIN.
// FILTER computes personal/global in one JSONB scan. Row-equality validated
// against e2e fixture. Words are stored uppercase in DB, so no UPPER() needed.
export const makeWordFrequencyQuery =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  <R extends Schema.ConstraintCodec<any>>(sql: SqlClient.SqlClient) =>
    (args: { metricName: string; Result: R }) => {
      const query = SqlSchema.findAll({
        Request: AnyChartArgs,
        Result: args.Result,
        execute: ({ sessionId, solutionsLanguage }) => sql`
      SELECT
        kv.key AS word,
        COALESCE(SUM(kv.value::int) FILTER (WHERE session_id = ${sessionId}), 0)::int AS personal,
        SUM(kv.value::int)::int AS global
      FROM global_pulse,
      LATERAL jsonb_each_text(metric_payload->'occurrences') AS kv(key, value)
      WHERE metric_name = ${args.metricName}
        AND solutions_language = ${solutionsLanguage}
      GROUP BY kv.key
      ORDER BY
        CASE WHEN COALESCE(SUM(kv.value::int) FILTER (WHERE session_id = ${sessionId}), 0) > 0 THEN 1 ELSE 0 END DESC,
        SUM(kv.value::int) DESC,
        COALESCE(SUM(kv.value::int) FILTER (WHERE session_id = ${sessionId}), 0) DESC,
        kv.key ASC
      LIMIT 15`,
      });

      return (request: AnyChartArgs) =>
        query(request).pipe(Effect.tapError(Effect.logError), Effect.catchTags({ SchemaError: Effect.die, SqlError: Effect.die }));
    };
