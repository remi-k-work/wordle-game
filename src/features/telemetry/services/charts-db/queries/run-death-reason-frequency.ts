// services, features, and other libraries
import { SqlClient, SqlSchema } from "effect/unstable/sql";
import { AnyChartArgs, RunDeathReasonFrequencyData } from "@/features/telemetry/services/charts-db";
import { dieOnDbFailure } from "@/lib/db";

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
    WHERE metric_name = 'runDeathReason'
      AND solutions_language = ${solutionsLanguage}
    GROUP BY kv.key
    ORDER BY reason ASC`,
  });

  return (request: AnyChartArgs) => dieOnDbFailure(query(request));
};
