// services, features, and other libraries
import { SqlClient, SqlSchema } from "effect/sql";
import { AnyAvgStatArgs, AnyAvgStatData } from "@/features/telemetry/services/charts-db/models";
import { dieOnDbFailure } from "@/domain/db-policy";

export const anyAvgStatQuery = (sql: SqlClient.SqlClient) => {
  const query = SqlSchema.findOne({
    Request: AnyAvgStatArgs,
    Result: AnyAvgStatData,
    execute: ({ statColumn, statTable, sessionId, solutionsLanguage }) => {
      // One query shape for both tables; only the FROM clause differs
      // (run_word_event joins arcade_run_summary to resolve the session)
      const alias = statTable === "runWordEvent" ? sql("rwe") : sql("ars");
      const from = statTable === "runWordEvent" ? sql`run_word_event rwe JOIN arcade_run_summary ars ON rwe.run_id = ars.run_id` : sql`arcade_run_summary ars`;

      return sql`
    WITH global_avg AS (
      SELECT ROUND(AVG(${alias}.${sql(statColumn)}))::int AS global_avg
      FROM ${from}
      WHERE ${alias}.solutions_language = ${solutionsLanguage}
    ),
    personal_avg AS (
      SELECT ROUND(AVG(${alias}.${sql(statColumn)}))::int AS personal_avg
      FROM ${from}
      WHERE ${alias}.solutions_language = ${solutionsLanguage}
        AND ars.session_id = ${sessionId}
    )
    SELECT
      COALESCE((SELECT personal_avg FROM personal_avg), 0) AS personal,
      COALESCE((SELECT global_avg   FROM global_avg),   0) AS global`;
    },
  });

  return (request: AnyAvgStatArgs) => dieOnDbFailure(query(request));
};
