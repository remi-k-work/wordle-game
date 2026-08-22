import { Effect } from "effect";
import { SqlClient } from "effect/unstable/sql";

const migration = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;
  yield* sql`
-- high-score schema
CREATE TABLE IF NOT EXISTS high_score (
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

CREATE INDEX IF NOT EXISTS high_score_ranking_idx
  ON high_score (solutions_lang, score DESC, streak DESC);

-- seed data (only runs once on first migration)
INSERT INTO high_score (player_name, score, streak, solutions_lang)
VALUES
  ('ACE', 4200, 18, 'En'),
  ('FOX', 3900, 16, 'En'),
  ('JET', 3600, 15, 'Pl'),
  ('MAX', 3300, 14, 'En'),
  ('ZED', 3000, 13, 'En'),
  ('NIX', 2700, 12, 'En'),
  ('KAI', 2400, 10, 'Pl'),
  ('ORB', 2100, 9, 'En'),
  ('VEX', 1800, 8, 'Pl'),
  ('PIP', 1500, 7, 'En')
ON CONFLICT DO NOTHING;
`;
});

export default migration;
