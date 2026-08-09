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
export const makeHistogramDistributionQuery =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  <R extends Schema.ConstraintCodec<any>>(sql: SqlClient.SqlClient) =>
    (args: { metricName: string; bucketAlias: string; Result: R }) => {
      const query = SqlSchema.findAll({
        Request: AnyChartArgs,
        Result: args.Result,
        execute: ({ sessionId, solutionsLanguage }) => sql`
      WITH global_histogram AS (
        SELECT 
          COALESCE((bucket->>0)::int, -1) AS join_boundary,
          SUM((bucket->>1)::int)::int AS global_count
        FROM global_pulse,
        LATERAL jsonb_array_elements(metric_payload->'buckets') AS bucket
        WHERE metric_name = ${args.metricName}
          AND solutions_language = ${solutionsLanguage}
        GROUP BY join_boundary
      ),
      personal_histogram AS (
        SELECT 
          COALESCE((bucket->>0)::int, -1) AS join_boundary,
          SUM((bucket->>1)::int)::int AS personal_count
        FROM global_pulse,
        LATERAL jsonb_array_elements(metric_payload->'buckets') AS bucket
        WHERE metric_name = ${args.metricName}
          AND solutions_language = ${solutionsLanguage}
          AND session_id = ${sessionId}
        GROUP BY join_boundary
      )
      SELECT 
        NULLIF(COALESCE(g.join_boundary, p.join_boundary), -1) AS ${sql(args.bucketAlias)},
        COALESCE(p.personal_count, 0) AS personal,
        COALESCE(g.global_count, 0) AS global
      FROM global_histogram g
      FULL OUTER JOIN personal_histogram p 
        ON g.join_boundary = p.join_boundary
      ORDER BY ${sql(args.bucketAlias)} ASC NULLS LAST`,
      });

      return (request: AnyChartArgs) =>
        query(request).pipe(Effect.tapError(Effect.logError), Effect.catchTags({ SchemaError: Effect.die, SqlError: Effect.die }));
    };
