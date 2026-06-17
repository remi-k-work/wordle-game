// services, features, and other libraries
import { Context, Effect, Layer, Schema } from "effect";
import { SqlClient } from "effect/unstable/sql";
import { GuessDistributionArgs, GuessDistributionData } from "@/features/telemetry/domain";
import { PgLive } from "@/lib/pg-live";

export class ChartsDB extends Context.Service<ChartsDB>()("ChartsDB", {
  make: Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient;

    const getGuessDistribution = ({ sessionId, solutionsLanguage }: GuessDistributionArgs) =>
      Effect.gen(function* () {
        // Use v4 plain typed statements for complex analytical queries.
        // We type 'personal' and 'global' as string | number because Postgres SUM()
        // returns bigints as strings to avoid JS precision loss.
        const rows = yield* sql<{ turn: number; personal: string | number; global: string | number }>`
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
            ORDER BY turn ASC;
          `;

        // Perform the Cumulative -> Discrete math securely
        let prevPersonalCumulative = 0;
        let prevGlobalCumulative = 0;

        // Coerce strings from DB into numbers
        const safeRows = rows.map((row) => ({ turn: Number(row.turn), personal: Number(row.personal), global: Number(row.global) }));

        const totalPersonal = safeRows.length > 0 ? safeRows[safeRows.length - 1].personal : 0;
        const totalGlobal = safeRows.length > 0 ? safeRows[safeRows.length - 1].global : 0;

        const chartData = safeRows.map((row) => {
          const discretePersonal = row.personal - prevPersonalCumulative;
          const discreteGlobal = row.global - prevGlobalCumulative;

          prevPersonalCumulative = row.personal;
          prevGlobalCumulative = row.global;

          return {
            turn: row.turn,
            personal: discretePersonal,
            global: discreteGlobal,
            personalPct: totalPersonal > 0 ? Math.round((discretePersonal / totalPersonal) * 100) : 0,
            globalPct: totalGlobal > 0 ? Math.round((discreteGlobal / totalGlobal) * 100) : 0,
          };
        });

        // Decode against the strict schema, as recommended for final domain mapping
        return yield* Schema.decodeUnknownEffect(GuessDistributionData)(chartData);
      }).pipe(Effect.tapError(Effect.logError), Effect.catchTags({ SchemaError: Effect.die, SqlError: Effect.die }));

    return { getGuessDistribution } as const;
  }),
}) {
  static readonly layer = Layer.effect(this, this.make).pipe(Layer.provide(PgLive));
}
