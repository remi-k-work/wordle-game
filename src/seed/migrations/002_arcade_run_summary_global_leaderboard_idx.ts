import { Effect } from "effect";
import { SqlClient } from "effect/unstable/sql";

const migration = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;
  yield* sql`CREATE INDEX IF NOT EXISTS arcade_run_summary_global_leaderboard_idx
      ON arcade_run_summary (solutions_language, final_score DESC, final_streak DESC)`;
});

export default migration;