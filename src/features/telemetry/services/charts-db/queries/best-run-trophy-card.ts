// services, features, and other libraries
import { SqlClient, SqlSchema } from "effect/unstable/sql";
import { BestRunTrophyCardArgs, BestRunTrophyCardData } from "@/features/telemetry/services/charts-db";
import { dieOnDbFailure } from "@/lib/db";

export const bestRunTrophyCardQuery = (sql: SqlClient.SqlClient) => {
  const query = SqlSchema.findOneOption({
    Request: BestRunTrophyCardArgs,
    Result: BestRunTrophyCardData,
    execute: ({ whichBestRun, sessionId, solutionsLanguage }) => {
      const sessionFilter = whichBestRun === "personal" ? sql`AND session_id = ${sessionId}` : sql``;
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
