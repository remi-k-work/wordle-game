// services, features, and other libraries
import { Context, Effect, Layer } from "effect";
import { SqlClient, SqlSchema } from "effect/unstable/sql";
import { GuessDistributionArgs, GuessDistributionData } from "@/features/telemetry/domain";
import { PgLive } from "@/lib/pg-live";

export class ChartsDB extends Context.Service<ChartsDB>()("ChartsDB", {
  make: Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient;

    const getGuessDistribution = SqlSchema.findAll({
      Request: GuessDistributionArgs,
      Result: GuessDistributionData,
      execute: ({ sessionId, solutionsLanguage }) =>
        sql`
    WITH global_histogram AS (
      SELECT 
        -- Extract the first element (the boundary) from the bucket array
        bucket->>0 AS turn_boundary,
        -- Extract the second element (the count), cast to INT, and SUM it
        SUM((bucket->>1)::int) AS global_count
      FROM global_pulse,
      -- This lateral join unrolls the JSON array into individual rows
      LATERAL jsonb_array_elements(metric_payload->'buckets') AS bucket
      WHERE metric_name = 'guessesToWin' 
        AND solutions_language = ${solutionsLanguage}
      GROUP BY bucket->>0
    ),
    personal_histogram AS (
      SELECT 
        bucket->>0 AS turn_boundary,
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
    -- Full Outer Join ensures we get a row even if the player hasn't hit that turn yet
    FULL OUTER JOIN personal_histogram p 
      ON g.turn_boundary = p.turn_boundary
    -- Filter out the OpenTelemetry 'null' catch-all bucket (usually represents failed runs)
    WHERE COALESCE(g.turn_boundary, p.turn_boundary) IS NOT NULL
    ORDER BY turn ASC;
  `,
    });

    return {
      getGuessDistribution: (request: GuessDistributionArgs) =>
        getGuessDistribution(request).pipe(Effect.tapError(Effect.logError), Effect.catchTags({ SchemaError: Effect.die, SqlError: Effect.die })),
    } as const;
  }),
}) {
  static readonly layer = Layer.effect(this, this.make).pipe(Layer.provide(PgLive));
}
