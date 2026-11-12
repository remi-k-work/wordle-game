// services, features, and other libraries
import { Schema } from "effect";
import { SqlClient, SqlSchema } from "effect/sql";
import { AnyChartArgs } from "@/features/charts/domain/models";
import { dieOnDbFailure } from "@/domain/helpers";

// types
import type { BucketAlias, MetricName } from "@/features/charts/domain/constants";

// Factory backing timeToSolve, arcadeStreak, guessDistribution. All three
// share the same query shape; metricName, bucketAlias, and Result schema
// differ per call-site. A2/A3: sentinel -1 pattern + GROUP BY join_boundary
// preserves trailing cumulative total row (NULLIF back to NULL).
// C1: single-pass conditional aggregation replaces two-CTE FULL OUTER JOIN.

/**
 * The generic bound for every query factory's `Result` schema.
 *
 * Not the full `Codec` (whose extra `annotate`/`rebuild`/... protocol
 * `SqlSchema.findAll` never calls) and not the plain `Constraint` (which types
 * `Type` as `unknown`, collapsing the decoded rows to `unknown[]` at every
 * generic inference hop — dieOnDbFailure, `.pipe — and breaking every
 * consumer). `ConstraintCodec`'s typed views keep the row type threading while
 * the runtime decode inside SqlSchema.findAll stays strict
 */
export type RowCodec = Schema.ConstraintCodec<any>;

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
