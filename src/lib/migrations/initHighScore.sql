DROP TABLE IF EXISTS high_score;

CREATE TABLE high_score (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  player_name CHAR(3) NOT NULL
    CONSTRAINT high_score_player_name_check
    CHECK (player_name ~ '^[A-Z]{3}$'),

  score INT NOT NULL
    CONSTRAINT high_score_score_check
    CHECK (score >= 0),

  streak INT NOT NULL
    CONSTRAINT high_score_streak_check
    CHECK (streak >= 0),

  solutions_lang VARCHAR(2) NOT NULL
    CONSTRAINT high_score_solutions_lang_check
    CHECK (solutions_lang IN ('En', 'Pl')),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Optimized for language-filtered high score queries
CREATE INDEX high_score_ranking_idx
  ON high_score (solutions_lang, score DESC, streak DESC);