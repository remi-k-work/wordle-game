// services, features, and other libraries
import { SqlClient, SqlSchema } from "effect/sql";
import { AnyChartArgs } from "@/features/charts/domain/models";
import { dieOnDbFailure } from "@/domain/helpers";

// types
import type { RowCodec } from "@/features/charts/domain/models";
import type { MetricName } from "@/features/telemetry/domain/metrics";

// Factory backing openingGuesses + failedWords
export const makeWordFrequencyQuery =
  <R extends RowCodec>(sql: SqlClient.SqlClient) =>
  // `metricName` is a bound parameter, so it is safe to interpolate; typing it
  // against the telemetry registry keeps the reader and the writer in step
  (args: { metricName: MetricName; Result: R }) => {
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

    return (request: AnyChartArgs) => dieOnDbFailure(query(request));
  };
