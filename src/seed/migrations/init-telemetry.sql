DROP TABLE IF EXISTS global_pulse;

CREATE TABLE global_pulse (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  metric_name VARCHAR(50) NOT NULL,
  
  metric_value INT NOT NULL,

  solutions_lang VARCHAR(2) NOT NULL
    CONSTRAINT global_pulse_solutions_lang_check
    CHECK (solutions_lang IN ('En', 'Pl')),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Optimized for Time-Series graphing on the landing page
CREATE INDEX global_pulse_time_series_idx 
  ON global_pulse (metric_name, solutions_lang, created_at DESC);

INSERT INTO global_pulse (metric_name, metric_value, solutions_lang)
VALUES
  ('gamesPlayed', 1, 'En'),
  ('validGuesses', 12, 'En'),
  ('invalidGuesses', 2, 'Pl'),
  ('openingGuesses', 1, 'En'),
  ('timeToSolve', 14.5, 'En');


DROP TABLE IF EXISTS arcade_runs_summary;

CREATE TABLE arcade_runs_summary (
  run_id UUID PRIMARY KEY,

  death_reason VARCHAR(10) NOT NULL
    CONSTRAINT arcade_runs_summary_death_reason_check
    CHECK (death_reason IN ('Forfeit', 'Guesses')),

  failed_on_word VARCHAR(5) NOT NULL,

  final_score INT NOT NULL
    CONSTRAINT arcade_runs_summary_score_check
    CHECK (final_score >= 0),

  final_streak INT NOT NULL
    CONSTRAINT arcade_runs_summary_streak_check
    CHECK (final_streak >= 0),

  duration_seconds INT NOT NULL
    CONSTRAINT arcade_runs_summary_duration_check
    CHECK (duration_seconds >= 0),

  solutions_lang VARCHAR(2) NOT NULL
    CONSTRAINT arcade_runs_summary_solutions_lang_check
    CHECK (solutions_lang IN ('En', 'Pl')),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Optimized for Leaderboards and "Highest Streaks of the Day"
CREATE INDEX arcade_runs_summary_leaderboard_idx 
  ON arcade_runs_summary (solutions_lang, final_score DESC, final_streak DESC);

INSERT INTO arcade_runs_summary (run_id, death_reason, failed_on_word, final_score, final_streak, duration_seconds, solutions_lang)
VALUES
  ('run-abc-123', 'Guesses', 'XYLYL', 4200, 18, 450, 'En'),
  ('run-def-456', 'Forfeit', 'N/A', 1500, 7, 120, 'Pl');


DROP TABLE IF EXISTS run_word_events;

CREATE TABLE run_word_events (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  -- Links back to arcade_runs_summary logically (No strict FK constraint for safety)
  run_id UUID NOT NULL,

  word VARCHAR(5) NOT NULL,

  guessed_turn INT NOT NULL
    CONSTRAINT run_word_events_guessed_turn_check
    CHECK (guessed_turn BETWEEN 1 AND 6),

  time_seconds INT NOT NULL
    CONSTRAINT run_word_events_time_seconds_check
    CHECK (time_seconds >= 0),

  solutions_lang VARCHAR(2) NOT NULL
    CONSTRAINT run_word_events_solutions_lang_check
    CHECK (solutions_lang IN ('En', 'Pl')),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Optimized for the "Drill-Down" query: SELECT * FROM run_word_events WHERE run_id = ? ORDER BY created_at ASC
CREATE INDEX run_word_events_drill_down_idx 
  ON run_word_events (run_id, created_at ASC);

INSERT INTO run_word_events (run_id, word, guessed_turn, time_seconds, solutions_lang)
VALUES
  ('run-abc-123', 'APPLE', 3, 12, 'En'),
  ('run-abc-123', 'TRAIN', 1, 4, 'En'),
  ('run-abc-123', 'MOUSE', 6, 45, 'En'),
  ('run-def-456', 'KOTKI', 2, 8, 'Pl');