// services, features, and other libraries
import { Effect } from "effect";
import { SqlClient, SqlSchema } from "effect/unstable/sql";
import { AnyCounterArgs, AnyCounterData } from "@/features/telemetry/services/charts-db";

export const anyCounterQuery = (sql: SqlClient.SqlClient) => {
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
    Request: AnyCounterArgs,
    Result: AnyCounterData,
    execute: ({ counterName, sessionId, solutionsLanguage }) => sql`
      WITH global_counter AS (
        SELECT 
          SUM((metric_payload->>'count')::bigint)::int AS global_total
        FROM global_pulse
        WHERE metric_name = ${counterName}
          AND solutions_language = ${solutionsLanguage}
      ),
      personal_counter AS (
        SELECT 
          SUM((metric_payload->>'count')::bigint)::int AS personal_total
        FROM global_pulse
        WHERE metric_name = ${counterName}
          AND solutions_language = ${solutionsLanguage}
          AND session_id = ${sessionId}
      )
      SELECT 
        COALESCE((SELECT personal_total FROM personal_counter), 0) AS personal,
        COALESCE((SELECT global_total   FROM global_counter),   0) AS global`,
  });

  return (request: AnyCounterArgs) =>
    query(request).pipe(
      Effect.tapError(Effect.logError),
      Effect.catchTags({
        SchemaError: Effect.die,
        SqlError: Effect.die,
        NoSuchElementError: Effect.die,
      })
    );
};
