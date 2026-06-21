// services, features, and other libraries
import { SqlClient } from "effect/unstable/sql";
import { TimeToSolveDistributionArgs } from "@/features/telemetry/services/charts-db";

export const timeToSolveDistributionQuery = (sql: SqlClient.SqlClient, { sessionId, solutionsLanguage }: TimeToSolveDistributionArgs) =>
  sql<{ maxSeconds: number | null; personal: string | number; global: string | number }>`
      WITH global_histogram AS (
        SELECT 
          COALESCE((bucket->>0)::int, -1) AS join_boundary,
          SUM((bucket->>1)::int)::int AS global_count
        FROM global_pulse,
        LATERAL jsonb_array_elements(metric_payload->'buckets') AS bucket
        WHERE metric_name = 'timeToSolve' 
          AND solutions_language = ${solutionsLanguage}
        GROUP BY bucket->>0
      ),
      personal_histogram AS (
        SELECT 
          COALESCE((bucket->>0)::int, -1) AS join_boundary,
          SUM((bucket->>1)::int)::int AS personal_count
        FROM global_pulse,
        LATERAL jsonb_array_elements(metric_payload->'buckets') AS bucket
        WHERE metric_name = 'timeToSolve' 
          AND solutions_language = ${solutionsLanguage}
          AND session_id = ${sessionId}
        GROUP BY bucket->>0
      )
      SELECT 
        NULLIF(COALESCE(g.join_boundary, p.join_boundary), -1) AS max_seconds,
        COALESCE(p.personal_count, 0) AS personal,
        COALESCE(g.global_count, 0) AS global
      FROM global_histogram g
      FULL OUTER JOIN personal_histogram p 
        ON g.join_boundary = p.join_boundary
      ORDER BY max_seconds ASC NULLS LAST`;
