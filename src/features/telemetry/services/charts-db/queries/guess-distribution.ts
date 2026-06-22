// services, features, and other libraries
import { Effect } from "effect";
import { SqlClient, SqlSchema } from "effect/unstable/sql";
import { AnyChartArgs, GuessDistributionData } from "@/features/telemetry/services/charts-db";

export const guessDistributionQuery = (sql: SqlClient.SqlClient) => {
  const query = SqlSchema.findAll({
    Request: AnyChartArgs,
    Result: GuessDistributionData,
    execute: ({ sessionId, solutionsLanguage }) => sql`
            WITH global_histogram AS (
              SELECT 
                (bucket->>0)::int AS turn_boundary,
                SUM((bucket->>1)::int)::int AS global_count
              FROM global_pulse,
              LATERAL jsonb_array_elements(metric_payload->'buckets') AS bucket
              WHERE metric_name = 'guessesToWin' 
                AND solutions_language = ${solutionsLanguage}
              GROUP BY bucket->>0
            ),
            personal_histogram AS (
              SELECT 
                (bucket->>0)::int AS turn_boundary,
                SUM((bucket->>1)::int)::int AS personal_count
              FROM global_pulse,
              LATERAL jsonb_array_elements(metric_payload->'buckets') AS bucket
              WHERE metric_name = 'guessesToWin' 
                AND solutions_language = ${solutionsLanguage}
                AND session_id = ${sessionId}
              GROUP BY bucket->>0
            )
            SELECT 
              COALESCE(g.turn_boundary, p.turn_boundary) AS turn,
              COALESCE(p.personal_count, 0) AS personal,
              COALESCE(g.global_count, 0) AS global
            FROM global_histogram g
            FULL OUTER JOIN personal_histogram p 
              ON g.turn_boundary = p.turn_boundary
            WHERE COALESCE(g.turn_boundary, p.turn_boundary) IS NOT NULL
            ORDER BY turn ASC`,
  });

  return (request: AnyChartArgs) => query(request).pipe(Effect.tapError(Effect.logError), Effect.catchTags({ SchemaError: Effect.die, SqlError: Effect.die }));
};
