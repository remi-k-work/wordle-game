// services, features, and other libraries
import { Effect } from "effect";
import { Schema } from "effect";
import { SqlClient, SqlSchema } from "effect/unstable/sql";
import { AnyChartArgs } from "@/features/telemetry/services/charts-db";

// Factory backing the word-frequency chart pair (openingGuesses + failedWords).
// The two queries are byte-identical except for `metricName` and the `Result`
// schema — both differ per call-site, so they are passed in here. Pure SQL
// extraction; the `Result` schemas stay unchanged (transformResultNames still
// produces the same camelCase fields — see E1).
// `any` is required for the schema lower bound — `SqlSchema.findAll` infers
// the Result row type from R["Type"], and a narrower bound (e.g. `unknown`)
// widens the returned Effect to `Effect<unknown[]>`, breaking the caller type
// contract. This is the idiomatic Effect-SQL generic-schema shape.
//
// C1: single-pass conditional aggregation replaces the two-CTE FULL OUTER JOIN.
// Both passes expanded the same JSONB (metric_payload->'occurrences'); the
// FILTER clause computes personal/global in one scan. Row-equality validated
// against the existing e2e fixture.
export const makeWordFrequencyQuery =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  <R extends Schema.ConstraintCodec<any>>(sql: SqlClient.SqlClient) =>
    (args: { metricName: string; Result: R }) => {
      const query = SqlSchema.findAll({
        Request: AnyChartArgs,
        Result: args.Result,
        execute: ({ sessionId, solutionsLanguage }) => sql`
      SELECT
        UPPER(kv.key) AS word,
        COALESCE(SUM(kv.value::int) FILTER (WHERE session_id = ${sessionId}), 0)::int AS personal,
        SUM(kv.value::int)::int AS global
      FROM global_pulse,
      LATERAL jsonb_each_text(metric_payload->'occurrences') AS kv(key, value)
      WHERE metric_name = ${args.metricName}
        AND solutions_language = ${solutionsLanguage}
      GROUP BY UPPER(kv.key)
      ORDER BY
        CASE WHEN COALESCE(SUM(kv.value::int) FILTER (WHERE session_id = ${sessionId}), 0) > 0 THEN 1 ELSE 0 END DESC,
        SUM(kv.value::int) DESC,
        COALESCE(SUM(kv.value::int) FILTER (WHERE session_id = ${sessionId}), 0) DESC,
        UPPER(kv.key) ASC
      LIMIT 15`,
      });

      return (request: AnyChartArgs) =>
        query(request).pipe(Effect.tapError(Effect.logError), Effect.catchTags({ SchemaError: Effect.die, SqlError: Effect.die }));
    };
