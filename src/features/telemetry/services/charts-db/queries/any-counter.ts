// services, features, and other libraries
import { SqlClient, SqlSchema } from "effect/unstable/sql";
import { AnyCounterArgs, AnyCounterData } from "@/features/telemetry/services/charts-db/models";
import { dieOnDbFailure } from "@/domain/db-policy";

export const anyCounterQuery = (sql: SqlClient.SqlClient) => {
  const query = SqlSchema.findOne({
    Request: AnyCounterArgs,
    Result: AnyCounterData,
    execute: ({ counterName, sessionId, solutionsLanguage }) => sql`
      SELECT
        COALESCE(SUM((metric_payload->>'count')::bigint) FILTER (WHERE session_id = ${sessionId}), 0)::int AS personal,
        COALESCE(SUM((metric_payload->>'count')::bigint), 0)::int AS global
      FROM global_pulse
      WHERE metric_name = ${counterName}
        AND solutions_language = ${solutionsLanguage}`,
  });

  return (request: AnyCounterArgs) => dieOnDbFailure(query(request));
};
