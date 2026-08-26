import { Effect } from "effect";
import { SqlClient } from "effect/unstable/sql";

const migration = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;

  // Delete broken telemetry rows from the Effect RC upgrade period
  // RC deployed 2026-08-22; rows from 2026-08-22 onwards have missing trailing buckets
  // for guessesToWin (missing bucket 6) and arcadeRunLength (missing buckets 0 & 13)
  // This preserves correct historical data from Jun 21 - Aug 21
  yield* sql`
    DELETE FROM global_pulse
    WHERE created_at >= '2026-08-22'
      AND metric_name IN ('guessesToWin', 'arcadeRunLength')
  `;

  yield* Effect.log("[Migration] Deleted broken global_pulse rows from RC upgrade period");
});

export default migration;