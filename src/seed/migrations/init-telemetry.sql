DROP TABLE IF EXISTS global_pulse;

CREATE TABLE global_pulse (
  session_id UUID NOT NULL,
  instance_id UUID NOT NULL,
  solutions_language VARCHAR(2) NOT NULL
    CONSTRAINT global_pulse_solutions_language_check
    CHECK (solutions_language IN ('En', 'Pl')),
  metric_name VARCHAR(50) NOT NULL,

  metric_payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- The Composite Primary Key naturally enforces uniqueness for Upserts
  PRIMARY KEY (session_id, instance_id, solutions_language, metric_name)
);

-- We still keep this index! The Primary Key index prioritizes 'session_id', 
-- so this secondary index is essential for lightning-fast global aggregations.
CREATE INDEX global_pulse_metrics_lookup_idx 
  ON global_pulse (solutions_language, metric_name, created_at DESC);

--
--
--

DROP TABLE IF EXISTS arcade_run_summary;

CREATE TABLE arcade_run_summary (
  run_id UUID PRIMARY KEY,
  
  -- Links this specific run to the cumulative session metrics in global_pulse
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

-- Note: We now add session_id to this index so you can quickly fetch all runs for a specific session!
CREATE INDEX arcade_run_summary_leaderboard_idx 
  ON arcade_run_summary (session_id, solutions_language, final_score DESC, final_streak DESC);

--
--
--

DROP TABLE IF EXISTS run_word_event;

CREATE TABLE run_word_event (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  -- Links back to arcade_run_summary logically (No strict FK constraint for safety)
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

-- Optimized for the "Drill-Down" query: SELECT * FROM run_word_event WHERE run_id = ? ORDER BY created_at ASC
CREATE INDEX run_word_event_drill_down_idx 
  ON run_word_event (run_id, created_at ASC);