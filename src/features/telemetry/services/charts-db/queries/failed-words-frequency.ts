// services, features, and other libraries
import { Effect } from "effect";
import { SqlClient, SqlSchema } from "effect/unstable/sql";
import { AnyChartArgs, FailedWordsFrequencyData } from "@/features/telemetry/services/charts-db";

export const failedWordsFrequencyQuery = (sql: SqlClient.SqlClient) => {
  const query = SqlSchema.findAll({
    Request: AnyChartArgs,
    Result: FailedWordsFrequencyData,
    execute: ({ sessionId, solutionsLanguage }) => sql`
    WITH global_freq AS (
      SELECT 
        UPPER(kv.key) AS word, 
        SUM(kv.value::int)::int AS global
      FROM global_pulse,
      LATERAL jsonb_each_text(metric_payload->'occurrences') AS kv(key, value)
      WHERE metric_name = 'failedWords' 
        AND solutions_language = ${solutionsLanguage}
      GROUP BY UPPER(kv.key)
    ),
    personal_freq AS (
      SELECT 
        UPPER(kv.key) AS word, 
        SUM(kv.value::int)::int AS personal
      FROM global_pulse,
      LATERAL jsonb_each_text(metric_payload->'occurrences') AS kv(key, value)
      WHERE metric_name = 'failedWords' 
        AND solutions_language = ${solutionsLanguage}
        AND session_id = ${sessionId}
      GROUP BY UPPER(kv.key)
    )
    SELECT 
      COALESCE(g.word, p.word) AS word,
      COALESCE(p.personal, 0) AS personal,
      COALESCE(g.global, 0) AS global
    FROM global_freq g
    FULL OUTER JOIN personal_freq p 
      ON g.word = p.word
    ORDER BY CASE WHEN COALESCE(p.personal, 0) > 0 THEN 1 ELSE 0 END DESC, global DESC, personal DESC
    LIMIT 15`,
  });

  return (request: AnyChartArgs) => query(request).pipe(Effect.tapError(Effect.logError), Effect.catchTags({ SchemaError: Effect.die, SqlError: Effect.die }));
};
