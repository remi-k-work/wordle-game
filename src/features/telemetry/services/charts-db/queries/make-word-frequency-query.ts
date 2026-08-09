// services, features, and other libraries
import { Effect } from "effect";
import { Schema } from "effect";
import { SqlClient, SqlSchema } from "effect/unstable/sql";
import { AnyChartArgs } from "@/features/telemetry/services/charts-db";

// Factory backing the word-frequency chart pair (openingGuesses + failedWords).
// The two queries are byte-identical except for `metricName` and the `Result`
// schema — both differ per call-site, so they are passed in here. Pure SQL
// extraction; the `Result` schemas stay unchanged (transformResultNames still
// produces the same camelCase fields — see E1).
// `any` is required for the schema lower bound — `SqlSchema.findAll` infers
// the Result row type from R["Type"], and a narrower bound (e.g. `unknown`)
// widens the returned Effect to `Effect<unknown[]>`, breaking the caller type
// contract. This is the idiomatic Effect-SQL generic-schema shape.
export const makeWordFrequencyQuery =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  <R extends Schema.ConstraintCodec<any>>(sql: SqlClient.SqlClient) =>
    (args: { metricName: string; Result: R }) => {
      const query = SqlSchema.findAll({
        Request: AnyChartArgs,
        Result: args.Result,
        execute: ({ sessionId, solutionsLanguage }) => sql`
      WITH global_freq AS (
        SELECT 
          UPPER(kv.key) AS word, 
          SUM(kv.value::int)::int AS global
        FROM global_pulse,
        LATERAL jsonb_each_text(metric_payload->'occurrences') AS kv(key, value)
        WHERE metric_name = ${args.metricName}
          AND solutions_language = ${solutionsLanguage}
        GROUP BY UPPER(kv.key)
      ),
      personal_freq AS (
        SELECT 
          UPPER(kv.key) AS word, 
          SUM(kv.value::int)::int AS personal
        FROM global_pulse,
        LATERAL jsonb_each_text(metric_payload->'occurrences') AS kv(key, value)
        WHERE metric_name = ${args.metricName}
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
      ORDER BY CASE WHEN COALESCE(p.personal, 0) > 0 THEN 1 ELSE 0 END DESC, global DESC, personal DESC, word ASC
      LIMIT 15`,
      });

      return (request: AnyChartArgs) =>
        query(request).pipe(Effect.tapError(Effect.logError), Effect.catchTags({ SchemaError: Effect.die, SqlError: Effect.die }));
    };
