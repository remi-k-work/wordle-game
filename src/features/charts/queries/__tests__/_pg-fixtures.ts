import { Effect } from "effect";
import { SqlClient } from "effect/sql";
import { runDdlStatements } from "./_pg-container";

// Shared fixture layer for the chart-query e2e suites.
//
// Every chart query reads the same telemetry tables the production worker
// writes (seed/migrations/000_init_telemetry.ts), so each suite used to carry
// its own hand-truncated copy of that DDL — and the copies had already drifted
// (one suite had lost the `arcade_run_summary_streak_check` constraint, another
// the `created_at` column). Both live here now, and the session/instance UUIDs
// they seed with are shared too, so two suites talking about "session A" mean
// the same player.

// `global_pulse`: the metric store every distribution / frequency / counter
// query reads. Mirrors production DDL (the check constraint and the primary
// key are both load-bearing: the upsert targets that primary key).
export const GLOBAL_PULSE_DDL = `
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
  PRIMARY KEY (session_id, instance_id, solutions_language, metric_name)
);
`;

// `arcade_run_summary` + `run_word_event`: the two tables the average-stat and
// best-run queries read. `run_word_event` is dropped first because
// arcade_run_summary rows reference its runs.
export const RUN_SUMMARY_DDL = `
DROP TABLE IF EXISTS run_word_event;
DROP TABLE IF EXISTS arcade_run_summary;

CREATE TABLE arcade_run_summary (
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

CREATE TABLE run_word_event (
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
    CHECK (time_seconds >= 0)
);
`;

// The player identities every suite seeds with: A is the "personal" session
// under test, B a second Polish player (the global scope aggregates both), and
// the En pair exists only to prove the `solutions_language` filter excludes it.
// A1/A2 are A's two browser instances (a tab reload is a new instance, which is
// what the global_pulse primary key participates in)
export const SESSION_A = "829087ad-9e88-46f9-9f45-174c3bc9e046";
export const SESSION_B = "044a83ea-9fa8-415a-8186-28baaf86657d";
export const EN_SESSION = "80633be7-9d66-4d70-935e-fb031eeb3628";

export const INSTANCE_A1 = "9808cf3c-8d89-499d-b4a6-1246a068dae4";
export const INSTANCE_A2 = "3234aa66-a5e7-4ae8-8d9f-256209299fdf";
export const INSTANCE_B1 = "89925de3-c13b-4f8a-9a03-5a89c67f9418";
export const EN_INSTANCE = "3f76a487-99df-41d2-8ae7-6fb58d87d488";

// A session that matches no fixture row. Spelled as its own UUID rather than
// derived from SESSION_B by regex: the test means "an unknown player", and a
// replace-on-first-two-digits says nothing about that
export const UNKNOWN_SESSION = "ab4a83ea-9fa8-415a-8186-28baaf86657d";

// A row of `global_pulse`, in the shape the telemetry worker's metric snapshot
// produces (the JSON payload is stored as the already-encoded string)
export interface GlobalPulseRow {
  readonly sessionId: string;
  readonly instanceId: string;
  readonly language: "Pl" | "En";
  readonly metric: string;
  readonly payload: string;
}

// Seeds the shared `global_pulse` table from per-suite rows. `dropFirst` is
// false when the caller has already seeded and wants the rows accumulated
export const seedGlobalPulse = (rows: ReadonlyArray<GlobalPulseRow>, { dropFirst = true }: { readonly dropFirst?: boolean } = {}) =>
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient;
    if (dropFirst) yield* runDdlStatements(GLOBAL_PULSE_DDL);
    yield* Effect.forEach(
      rows,
      (row) => sql`
        INSERT INTO global_pulse (session_id, instance_id, solutions_language, metric_name, metric_payload)
        VALUES (${row.sessionId}, ${row.instanceId}, ${row.language}, ${row.metric}, ${row.payload}::jsonb)
      `,
      { discard: true }
    );
  });

// A row of `arcade_run_summary`
export interface RunSummaryRow {
  readonly runId: string;
  readonly sessionId: string;
  readonly language: "Pl" | "En";
  readonly deathReason: "Forfeit" | "Guesses";
  readonly failedOnWord: string;
  readonly finalScore: number;
  readonly finalStreak: number;
  readonly durationSeconds: number;
}

// A row of `run_word_event`
export interface RunWordEventRow {
  readonly runId: string;
  readonly language: "Pl" | "En";
  readonly theSecretWord: string;
  readonly guessedTurn: number;
  readonly timeSeconds: number;
}

// Seeds both run tables from per-suite rows, creating the schema first
export const seedRunTables = (runSummaryRows: ReadonlyArray<RunSummaryRow>, runWordEventRows: ReadonlyArray<RunWordEventRow>) =>
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient;
    yield* runDdlStatements(RUN_SUMMARY_DDL);
    yield* Effect.forEach(
      runSummaryRows,
      (row) => sql`
        INSERT INTO arcade_run_summary
          (run_id, session_id, solutions_language, death_reason, failed_on_word, final_score, final_streak, duration_seconds)
        VALUES
          (${row.runId}, ${row.sessionId}, ${row.language}, ${row.deathReason}, ${row.failedOnWord}, ${row.finalScore}, ${row.finalStreak}, ${row.durationSeconds})
      `,
      { discard: true }
    );
    yield* Effect.forEach(
      runWordEventRows,
      (row) => sql`
        INSERT INTO run_word_event (run_id, solutions_language, the_secret_word, guessed_turn, time_seconds)
        VALUES (${row.runId}, ${row.language}, ${row.theSecretWord}, ${row.guessedTurn}, ${row.timeSeconds})
      `,
      { discard: true }
    );
  });
