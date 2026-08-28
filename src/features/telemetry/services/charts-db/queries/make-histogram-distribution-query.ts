// services, features, and other libraries
import { Schema } from "effect";
import { SqlClient, SqlSchema } from "effect/unstable/sql";
import { AnyChartArgs } from "@/features/telemetry/services/charts-db";
import { dieOnDbFailure } from "@/lib/db";

// Factory backing timeToSolve, arcadeStreak, guessDistribution. All three
// share the same query shape; metricName, bucketAlias, and Result schema
// differ per call-site. A2/A3: sentinel -1 pattern + GROUP BY join_boundary
// preserves trailing cumulative total row (NULLIF back to NULL).
// C1: single-pass conditional aggregation replaces two-CTE FULL OUTER JOIN.
export const makeHistogramDistributionQuery =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  <R extends Schema.ConstraintCodec<any>>(sql: SqlClient.SqlClient) =>
    (args: { metricName: string; bucketAlias: string; Result: R }) => {
      const query = SqlSchema.findAll({
        Request: AnyChartArgs,
        Result: args.Result,
        execute: ({ sessionId, solutionsLanguage }) => sql`
      SELECT
        NULLIF(COALESCE((bucket->>0)::int, -1), -1) AS ${sql(args.bucketAlias)},
        COALESCE(SUM((bucket->>1)::int) FILTER (WHERE session_id = ${sessionId}), 0)::int AS personal,
        SUM((bucket->>1)::int)::int AS global
      FROM global_pulse,
      LATERAL jsonb_array_elements(metric_payload->'buckets') AS bucket
      WHERE metric_name = ${args.metricName}
        AND solutions_language = ${solutionsLanguage}
      GROUP BY COALESCE((bucket->>0)::int, -1)
      ORDER BY ${sql(args.bucketAlias)} ASC NULLS LAST`,
      });

      return (request: AnyChartArgs) => dieOnDbFailure(query(request));
    };
