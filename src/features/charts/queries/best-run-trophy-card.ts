// services, features, and other libraries
import { Match } from "effect";
import { SqlClient, SqlSchema } from "effect/sql";
import { BestRunTrophyCardArgs, BestRunTrophyCardData } from "@/features/charts/domain/models";
import { dieOnDbFailure } from "@/domain/helpers";

export const bestRunTrophyCardQuery = (sql: SqlClient.SqlClient) => {
  const query = SqlSchema.findOneOption({
    Request: BestRunTrophyCardArgs,
    Result: BestRunTrophyCardData,
    execute: ({ whichBestRun, sessionId, solutionsLanguage }) => {
      // `Match.exhaustive` makes a third `whichBestRun` literal a compile error
      // instead of silently returning the global run for it
      const sessionFilter = Match.value(whichBestRun).pipe(
        Match.when("personal", () => sql`AND session_id = ${sessionId}`),
        Match.when("global", () => sql``),
        Match.exhaustive
      );
      return sql`
    SELECT death_reason, failed_on_word, final_score, final_streak, duration_seconds, created_at
    FROM arcade_run_summary
    WHERE solutions_language = ${solutionsLanguage}
      ${sessionFilter}
    ORDER BY final_score DESC, final_streak DESC, created_at DESC
    LIMIT 1`;
    },
  });

  return (request: BestRunTrophyCardArgs) => dieOnDbFailure(query(request));
};
