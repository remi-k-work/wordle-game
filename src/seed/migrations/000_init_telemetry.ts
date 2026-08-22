import { Effect } from "effect";
import { SqlClient } from "effect/unstable/sql";

const migration = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;
  yield* sql`
-- telemetry schema
CREATE TABLE IF NOT EXISTS global_pulse (
  session_id UUID NOT NULL,
  instance_id UUID NOT NULL,
  solutions_language VARCHAR(2) NOT NULL
    CONSTRAINT global_pulse_solutions_language_check
    CHECK (solutions_language IN ('En', 'Pl')),
  metric_name VARCHAR(50) NOT NULL,
  metric_payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (session_id, instance_id, solutions_language, metric_name)
);

CREATE INDEX IF NOT EXISTS global_pulse_metrics_lookup_idx
  ON global_pulse (solutions_language, metric_name, created_at DESC);

CREATE TABLE IF NOT EXISTS arcade_run_summary (
  run_id UUID PRIMARY KEY,
  session_id UUID NOT NULL,
  solutions_language VARCHAR(2) NOT NULL
    CONSTRAINT arcade_run_summary_solutions_language_check
    CHECK (solutions_language IN ('En', 'Pl')),
  death_reason VARCHAR(10) NOT NULL
    CONSTRAINT arcade_run_summary_death_reason_check
    CHECK (death_reason IN ('Forfeit', 'Guesses')),
  failed_on_word VARCHAR(5) NOT NULL,
  final_score INT NOT NULL
    CONSTRAINT arcade_run_summary_score_check
    CHECK (final_score >= 0),
  final_streak INT NOT NULL
    CONSTRAINT arcade_run_summary_streak_check
    CHECK (final_streak >= 0),
  duration_seconds INT NOT NULL
    CONSTRAINT arcade_run_summary_duration_check
    CHECK (duration_seconds >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS arcade_run_summary_leaderboard_idx
  ON arcade_run_summary (session_id, solutions_language, final_score DESC, final_streak DESC);

CREATE TABLE IF NOT EXISTS run_word_event (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  run_id UUID NOT NULL,
  solutions_language VARCHAR(2) NOT NULL
    CONSTRAINT run_word_event_solutions_language_check
    CHECK (solutions_language IN ('En', 'Pl')),
  the_secret_word VARCHAR(5) NOT NULL,
  guessed_turn INT NOT NULL
    CONSTRAINT run_word_event_guessed_turn_check
    CHECK (guessed_turn BETWEEN 1 AND 6),
  time_seconds INT NOT NULL
    CONSTRAINT run_word_event_time_seconds_check
    CHECK (time_seconds >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS run_word_event_drill_down_idx
  ON run_word_event (run_id, created_at ASC);
`;
});

export default migration;
