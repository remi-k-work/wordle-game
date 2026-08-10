// services, features, and other libraries
import { Effect } from "effect";
import { SqlClient, SqlSchema } from "effect/unstable/sql";
import { AnyChartArgs, RunDeathReasonFrequencyData } from "@/features/telemetry/services/charts-db";

export const runDeathReasonFrequencyQuery = (sql: SqlClient.SqlClient) => {
  const query = SqlSchema.findAll({
    Request: AnyChartArgs,
    Result: RunDeathReasonFrequencyData,
    execute: ({ sessionId, solutionsLanguage }) => sql`
    WITH global_freq AS (
      SELECT 
        kv.key AS reason, 
        SUM(kv.value::int)::int AS global
      FROM global_pulse,
      LATERAL jsonb_each_text(metric_payload->'occurrences') AS kv(key, value)
      WHERE metric_name = 'runDeathReason' 
        AND solutions_language = ${solutionsLanguage}
      GROUP BY kv.key
    ),
    personal_freq AS (
      SELECT 
        kv.key AS reason, 
        SUM(kv.value::int)::int AS personal
      FROM global_pulse,
      LATERAL jsonb_each_text(metric_payload->'occurrences') AS kv(key, value)
      WHERE metric_name = 'runDeathReason' 
        AND solutions_language = ${solutionsLanguage}
        AND session_id = ${sessionId}
      GROUP BY kv.key
    )
    SELECT 
      COALESCE(g.reason, p.reason) AS reason,
      COALESCE(p.personal, 0) AS personal,
      COALESCE(g.global, 0) AS global
    FROM global_freq g
    FULL OUTER JOIN personal_freq p 
      ON g.reason = p.reason
    -- B4: alphabetical ordering is intentional. The consumer in
    -- ui/charts/frequencies/run-death-reason/index.tsx is a 2-slice PieChart
    -- keyed by the reason literal (Forfeit, Guesses); colour is mapped via
    -- the COLORS_PERSONAL/COLORS_GLOBAL lookups (order-independent), but
    -- recharts renders slices clockwise from 12 o'clock in array order — so
    -- alphabetical gives STABLE slice placement (Forfeit always at 12
    -- o'clock) across page loads, regardless of count distribution. With
    -- only two reasons, count-sorted ordering (global DESC, personal DESC,
    -- reason ASC) adds no information density (both slices are always
    -- rendered + labelled), and on the typical sample (Forfeit count >
    -- Guesses count) alphabetical already leads with Forfeit — the only
    -- observable difference would be a Guesses-leading player, whose slice
    -- position would flip. Stable placement was deemed the higher-value UX
    -- for a 2-slice pie. Do NOT switch to count-sorted without first
    -- confirming the consumer still doesn't surface a "top reasons" ordering
    -- preference.
    ORDER BY reason ASC`,
  });

  return (request: AnyChartArgs) => query(request).pipe(Effect.tapError(Effect.logError), Effect.catchTags({ SchemaError: Effect.die, SqlError: Effect.die }));
};
