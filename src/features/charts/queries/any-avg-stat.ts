// services, features, and other libraries
import { Match } from "effect";
import { SqlClient, SqlSchema } from "effect/sql";
import { AnyAvgStatArgs, AnyCounterData } from "@/features/charts/domain/models";
import { dieOnDbFailure } from "@/domain/helpers";

export const anyAvgStatQuery = (sql: SqlClient.SqlClient) => {
  const query = SqlSchema.findOne({
    Request: AnyAvgStatArgs,
    Result: AnyCounterData,
    execute: ({ statColumn, statTable, sessionId, solutionsLanguage }) => {
      // One query shape for both tables; only the FROM clause differs
      // (run_word_event joins arcade_run_summary to resolve the session).
      // `Match.exhaustive` makes a third `statTable` literal a compile error
      // instead of silently falling through to the arcade-run branch.
      // `sessionAlias` comes from the same arm as `from` so the session filter
      // can never reference an alias the chosen FROM clause does not define
      const { alias, from, sessionAlias } = Match.value(statTable).pipe(
        Match.when("runWordEvent", () => ({
          alias: sql("rwe"),
          from: sql`run_word_event rwe JOIN arcade_run_summary ars ON rwe.run_id = ars.run_id`,
          sessionAlias: sql("ars"),
        })),
        Match.when("arcadeRunSummary", () => ({ alias: sql("ars"), from: sql`arcade_run_summary ars`, sessionAlias: sql("ars") })),
        Match.exhaustive
      );

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
        AND ${sessionAlias}.session_id = ${sessionId}
    )
    SELECT
      COALESCE((SELECT personal_avg FROM personal_avg), 0) AS personal,
      COALESCE((SELECT global_avg   FROM global_avg),   0) AS global`;
    },
  });

  return (request: AnyAvgStatArgs) => dieOnDbFailure(query(request));
};
