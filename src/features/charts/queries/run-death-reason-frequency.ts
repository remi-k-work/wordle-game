// services, features, and other libraries
import { SqlClient, SqlSchema } from "effect/sql";
import { AnyChartArgs, RunDeathReasonFrequencyData } from "@/features/charts/domain/models";
import { dieOnDbFailure } from "@/domain/helpers";

// types
import type { MetricName } from "@/features/charts/domain/constants";

// Pinned to the telemetry registry's key so a metric rename surfaces here as a
// compile error rather than as a chart that quietly stops returning rows
const metricName = "runDeathReason" satisfies MetricName;

export const runDeathReasonFrequencyQuery = (sql: SqlClient.SqlClient) => {
  const query = SqlSchema.findAll({
    Request: AnyChartArgs,
    Result: RunDeathReasonFrequencyData,
    execute: ({ sessionId, solutionsLanguage }) => sql`
    SELECT
      kv.key AS reason,
      COALESCE(SUM(kv.value::int) FILTER (WHERE session_id = ${sessionId}), 0)::int AS personal,
      SUM(kv.value::int)::int AS global
    FROM global_pulse,
    LATERAL jsonb_each_text(metric_payload->'occurrences') AS kv(key, value)
    WHERE metric_name = ${metricName}
      AND solutions_language = ${solutionsLanguage}
    GROUP BY kv.key
    ORDER BY reason ASC`,
  });

  return (request: AnyChartArgs) => dieOnDbFailure(query(request));
};
