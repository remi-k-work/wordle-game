// services, features, and other libraries
import { Effect } from "effect";
import { SqlClient, SqlSchema } from "effect/unstable/sql";
import { AnyAvgStatArgs, AnyAvgStatData } from "@/features/telemetry/services/charts-db";

export const anyAvgStatQuery = (sql: SqlClient.SqlClient) => {
  const query = SqlSchema.findOne({
    Request: AnyAvgStatArgs,
    Result: AnyAvgStatData,
    execute: ({ statColumn, statTable, sessionId, solutionsLanguage }) =>
      statTable === "runWordEvent"
        ? sql`
    WITH global_avg AS (
      SELECT ROUND(AVG(rwe.${sql(statColumn)}))::int AS global_avg
      FROM run_word_event rwe
      WHERE rwe.solutions_language = ${solutionsLanguage}
    ),
    personal_avg AS (
      SELECT ROUND(AVG(rwe.${sql(statColumn)}))::int AS personal_avg
      FROM run_word_event rwe
      JOIN arcade_run_summary ars ON rwe.run_id = ars.run_id
      WHERE rwe.solutions_language = ${solutionsLanguage}
        AND ars.session_id = ${sessionId}
    )
    SELECT
      COALESCE((SELECT personal_avg FROM personal_avg), 0) AS personal,
      COALESCE((SELECT global_avg   FROM global_avg),   0) AS global`
        : sql`
    WITH global_avg AS (
      SELECT ROUND(AVG(ars.${sql(statColumn)}))::int AS global_avg
      FROM arcade_run_summary ars
      WHERE ars.solutions_language = ${solutionsLanguage}
    ),
    personal_avg AS (
      SELECT ROUND(AVG(ars.${sql(statColumn)}))::int AS personal_avg
      FROM arcade_run_summary ars
      WHERE ars.solutions_language = ${solutionsLanguage}
        AND ars.session_id = ${sessionId}
    )
    SELECT
      COALESCE((SELECT personal_avg FROM personal_avg), 0) AS personal,
      COALESCE((SELECT global_avg   FROM global_avg),   0) AS global`,
  });

  return (request: AnyAvgStatArgs) =>
    query(request).pipe(
      Effect.tapError(Effect.logError),
      Effect.catchTags({
        SchemaError: Effect.die,
        SqlError: Effect.die,
        NoSuchElementError: Effect.die,
      })
    );
};
