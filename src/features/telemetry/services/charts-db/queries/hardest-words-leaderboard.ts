// services, features, and other libraries
import { Effect } from "effect";
import { SqlClient, SqlSchema } from "effect/unstable/sql";
import { AnyChartArgs, HardestWordsLeaderboardData } from "@/features/telemetry/services/charts-db";

export const hardestWordsLeaderboardQuery = (sql: SqlClient.SqlClient) => {
  const query = SqlSchema.findAll({
    Request: AnyChartArgs,
    Result: HardestWordsLeaderboardData,
    execute: ({ sessionId, solutionsLanguage }) => sql`
    WITH global_difficulty AS (
      SELECT
        the_secret_word AS word,
        ROUND(AVG(time_seconds))::int AS avg_time,
        ROUND(AVG(guessed_turn)::numeric, 1) AS avg_guesses
      FROM run_word_event
      WHERE solutions_language = ${solutionsLanguage}
      GROUP BY the_secret_word
    ),
    personal_difficulty AS (
      SELECT
        rwe.the_secret_word AS word,
        ROUND(AVG(rwe.time_seconds))::int AS avg_time,
        ROUND(AVG(rwe.guessed_turn)::numeric, 1) AS avg_guesses
      FROM run_word_event rwe
      JOIN arcade_run_summary ars ON rwe.run_id = ars.run_id
      WHERE rwe.solutions_language = ${solutionsLanguage}
        AND ars.session_id = ${sessionId}
      GROUP BY rwe.the_secret_word
    )
    SELECT
      COALESCE(g.word, p.word) AS word,
      COALESCE(p.avg_time, 0) AS personal_avg_time_seconds,
      COALESCE(p.avg_guesses, 0) AS personal_avg_guesses,
      COALESCE(g.avg_time, 0) AS global_avg_time_seconds,
      COALESCE(g.avg_guesses, 0) AS global_avg_guesses
    FROM global_difficulty g
    FULL OUTER JOIN personal_difficulty p ON g.word = p.word
    ORDER BY COALESCE(g.avg_time, 0) DESC, word ASC
    LIMIT 15`,
  });

  return (request: AnyChartArgs) => query(request).pipe(Effect.tapError(Effect.logError), Effect.catchTags({ SchemaError: Effect.die, SqlError: Effect.die }));
};
