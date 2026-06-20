// services, features, and other libraries
import { Effect } from "effect";
import { SqlClient, SqlSchema } from "effect/unstable/sql";
import { RunDeathReasonFrequencyArgs, RunDeathReasonFrequencyData } from "@/features/telemetry/services/charts-db";

export const runDeathReasonFrequencyQuery = (sql: SqlClient.SqlClient) => {
  const query = SqlSchema.findAll({
    Request: RunDeathReasonFrequencyArgs,
    Result: RunDeathReasonFrequencyData,
    execute: ({ sessionId, solutionsLanguage }) => sql`
    WITH global_freq AS (
      SELECT 
        kv.key AS reason, 
        SUM(kv.value::int)::int AS global
      FROM global_pulse,
      LATERAL jsonb_each_text(metric_payload->'occurrences') AS kv(key, value)
      WHERE metric_name = 'runDeathReason' 
        AND solutions_language = ${solutionsLanguage}
      GROUP BY kv.key
    ),
    personal_freq AS (
      SELECT 
        kv.key AS reason, 
        SUM(kv.value::int)::int AS personal
      FROM global_pulse,
      LATERAL jsonb_each_text(metric_payload->'occurrences') AS kv(key, value)
      WHERE metric_name = 'runDeathReason' 
        AND solutions_language = ${solutionsLanguage}
        AND session_id = ${sessionId}
      GROUP BY kv.key
    )
    SELECT 
      COALESCE(g.reason, p.reason) AS reason,
      COALESCE(p.personal, 0) AS personal,
      COALESCE(g.global, 0) AS global
    FROM global_freq g
    FULL OUTER JOIN personal_freq p 
      ON g.reason = p.reason
    ORDER BY reason ASC`,
  });

  return (request: RunDeathReasonFrequencyArgs) =>
    query(request).pipe(Effect.tapError(Effect.logError), Effect.catchTags({ SchemaError: Effect.die, SqlError: Effect.die }));
};
