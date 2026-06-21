// services, features, and other libraries
import { Effect } from "effect";
import { SqlClient, SqlSchema } from "effect/unstable/sql";
import { AnyCounterArgs, AnyCounterData } from "@/features/telemetry/services/charts-db";

export const anyCounterQuery = (sql: SqlClient.SqlClient) => {
  const query = SqlSchema.findAll({
    Request: AnyCounterArgs,
    Result: AnyCounterData,
    execute: ({ counterName, sessionId, solutionsLanguage }) => sql`
      WITH global_counter AS (
        SELECT 
          SUM((metric_payload->>'count')::numeric)::int AS global_total
        FROM global_pulse
        WHERE metric_name = ${counterName}
          AND solutions_language = ${solutionsLanguage}
      ),
      personal_counter AS (
        SELECT 
          SUM((metric_payload->>'count')::numeric)::int AS personal_total
        FROM global_pulse
        WHERE metric_name = ${counterName}
          AND solutions_language = ${solutionsLanguage}
          AND session_id = ${sessionId}
      )
      SELECT 
        COALESCE(p.personal_total, 0) AS personal,
        COALESCE(g.global_total, 0) AS global
      FROM global_counter g
      CROSS JOIN personal_counter p`,
  });

  return (request: AnyCounterArgs) =>
    query(request).pipe(Effect.tapError(Effect.logError), Effect.catchTags({ SchemaError: Effect.die, SqlError: Effect.die }));
};
