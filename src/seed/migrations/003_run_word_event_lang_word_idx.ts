import { Effect } from "effect";
import { SqlClient } from "effect/unstable/sql";

const migration = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;
  yield* sql`CREATE INDEX IF NOT EXISTS run_word_event_lang_word_idx
      ON run_word_event (solutions_language, the_secret_word)`;
});

export default migration;