// services, features, and other libraries
import { Effect } from "effect";
import { Schema } from "effect";
import { SqlClient, SqlSchema } from "effect/unstable/sql";
import { AnyChartArgs } from "@/features/telemetry/services/charts-db";

// Factory backing the histogram chart trio (timeToSolve + arcadeStreak +
// guessDistribution, the last via the A3 sentinel unification). The three
// queries are byte-identical except for `metricName`, the outer SELECT column
// alias (`bucketAlias` — also used in `ORDER BY <alias> ASC NULLS LAST`), and
// the `Result` schema — all three differ per call-site and are passed in here.
// The sentinel `-1` pattern (A3) and `GROUP BY join_boundary` (A2) are baked
// in. Pure SQL extraction; the `Result` schemas stay unchanged
// (transformResultNames still produces the same camelCase fields — see E1).
//
// C1: single-pass conditional aggregation replaces two-CTE FULL OUTER JOIN.
// Both CTEs expanded the same JSONB (metric_payload->'buckets'); FILTER
// computes personal/global in one scan. The sentinel `-1` bucket (trailing
// cumulative total row) is preserved via GROUP BY COALESCE((bucket->>0)::int, -1)
// and NULLIF back to NULL — validated against cumulativeToDistribution
// fixture.
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

      return (request: AnyChartArgs) =>
        query(request).pipe(Effect.tapError(Effect.logError), Effect.catchTags({ SchemaError: Effect.die, SqlError: Effect.die }));
    };
