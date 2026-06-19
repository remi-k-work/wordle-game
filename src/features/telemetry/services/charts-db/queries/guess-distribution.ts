// services, features, and other libraries
import { SqlClient } from "effect/unstable/sql";
import { GuessDistributionArgs } from "@/features/telemetry/services/charts-db";

export const guessDistributionQuery = (sql: SqlClient.SqlClient, { sessionId, solutionsLanguage }: GuessDistributionArgs) =>
  sql<{ turn: number; personal: string | number; global: string | number }>`
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
                (bucket->>1)::int AS personal_count
              FROM global_pulse,
              LATERAL jsonb_array_elements(metric_payload->'buckets') AS bucket
              WHERE metric_name = 'guessesToWin' 
                AND solutions_language = ${solutionsLanguage}
                AND session_id = ${sessionId}
            )
            SELECT 
              COALESCE(g.turn_boundary, p.turn_boundary) AS turn,
              COALESCE(p.personal_count, 0) AS personal,
              COALESCE(g.global_count, 0) AS global
            FROM global_histogram g
            FULL OUTER JOIN personal_histogram p 
              ON g.turn_boundary = p.turn_boundary
            WHERE COALESCE(g.turn_boundary, p.turn_boundary) IS NOT NULL
            ORDER BY turn ASC`;
