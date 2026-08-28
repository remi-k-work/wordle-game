// services, features, and other libraries
import { SqlClient, SqlSchema } from "effect/unstable/sql";
import { BestRunTrophyCardArgs, BestRunTrophyCardData } from "@/features/telemetry/services/charts-db";
import { dieOnDbFailure } from "@/lib/db";

export const bestRunTrophyCardQuery = (sql: SqlClient.SqlClient) => {
  const query = SqlSchema.findOneOption({
    Request: BestRunTrophyCardArgs,
    Result: BestRunTrophyCardData,
    execute: ({ whichBestRun, sessionId, solutionsLanguage }) =>
      whichBestRun === "personal"
        ? sql`
    SELECT death_reason, failed_on_word, final_score, final_streak, duration_seconds, created_at
    FROM arcade_run_summary
    WHERE solutions_language = ${solutionsLanguage}
      AND session_id = ${sessionId}
    ORDER BY final_score DESC, final_streak DESC, created_at DESC
    LIMIT 1`
        : sql`
    SELECT death_reason, failed_on_word, final_score, final_streak, duration_seconds, created_at
    FROM arcade_run_summary
    WHERE solutions_language = ${solutionsLanguage}
    ORDER BY final_score DESC, final_streak DESC, created_at DESC
    LIMIT 1`,
  });

  return (request: BestRunTrophyCardArgs) => dieOnDbFailure(query(request));
};
