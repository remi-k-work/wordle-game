// services, features, and other libraries
import { Effect } from "effect";
import { SqlClient, SqlSchema } from "effect/unstable/sql";
import { AnyAvgStatArgs, AnyAvgStatData } from "@/features/telemetry/services/charts-db";

export const anyAvgStatQuery = (sql: SqlClient.SqlClient) => {
  // A8: scalar subqueries (not CROSS JOIN) make single-row intent explicit —
  // each aggregate CTE returns exactly one row, so the outer SELECT produces
  // exactly one row. If a future edit adds GROUP BY to a CTE, Postgres raises
  // "more than one row returned by a subquery" (fail-loud) instead of silently
  // exploding cardinality to N×M.
  //
  // B5: SqlSchema.findOne (not findAll) enforces the single-row contract at the
  // schema layer. COALESCE materialises the scalar row even when no source rows
  // match, so NoSuchElementError is unreachable — escalate it to a defect per
  // the F3/F4 policy (do NOT simplify the COALESCE away; it's load-bearing for
  // this contract).
  const query = SqlSchema.findOne({
    Request: AnyAvgStatArgs,
    Result: AnyCounterData,
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
