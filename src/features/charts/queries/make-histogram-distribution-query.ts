// services, features, and other libraries
import { SqlClient, SqlSchema } from "effect/sql";
import { AnyChartArgs } from "@/features/charts/domain/models";
import { dieOnDbFailure } from "@/domain/helpers";

// types
import type { BucketAlias, RowCodec } from "@/features/charts/domain/models";
import type { MetricName } from "@/features/telemetry/domain/metrics";

// Factory backing timeToSolve, arcadeStreak, guessDistribution
export const makeHistogramDistributionQuery =
  <R extends RowCodec>(sql: SqlClient.SqlClient) =>
  // `bucketAlias` is interpolated into the statement text (not bound as a
  // parameter), hence the literal union; `metricName` is a bound parameter
  (args: { metricName: MetricName; bucketAlias: BucketAlias; Result: R }) => {
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
