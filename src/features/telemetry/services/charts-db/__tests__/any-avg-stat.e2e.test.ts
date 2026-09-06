import { describe, expect, it } from "@effect/vitest";
import { Effect, Schema } from "effect";
import { SqlClient } from "effect/unstable/sql";
import { PgContainer } from "./_pg-container";
import { AnyAvgStatArgs, anyAvgStatQuery } from "@/features/telemetry/services/charts-db";

// Minimal slice of init-telemetry.sql — the two tables any-avg-stat touches.
//   - run_word_event: rows keyed by run_id (referenced by arcade_run_summary)
//   - arcade_run_summary: rows keyed by run_id, session_id, solutions_language
// No FK; the query's personal branch joins through ars.run_id = rwe.run_id.
const DDL = `
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
    CHECK (final_streak >= 0),
  duration_seconds INT NOT NULL
    CHECK (duration_seconds >= 0)
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

const SESSION_A = "829087ad-9e88-46f9-9f45-174c3bc9e046";
const SESSION_B = "044a83ea-9fa8-415a-8186-28baaf86657d";
const EN_SESSION = "80633be7-9d66-4d70-935e-fb031eeb3628";

const RUN_A1 = "11111111-aaaa-aaaa-aaaa-111111111111";
const RUN_A2 = "22222222-aaaa-aaaa-aaaa-222222222222";
const RUN_B1 = "33333333-aaaa-aaaa-aaaa-333333333333";
const EN_RUN = "44444444-aaaa-aaaa-aaaa-444444444444";

type ArsRow = {
  runId: string;
  sessionId: string;
  language: "Pl" | "En";
  deathReason: "Forfeit" | "Guesses";
  failedOnWord: string;
  finalScore: number;
  finalStreak: number;
  durationSeconds: number;
};

type RweRow = {
  runId: string;
  language: "Pl" | "En";
  theSecretWord: string;
  guessedTurn: number;
  timeSeconds: number;
};

// Two Pl sessions (A = personal, B = other player), plus an En row filtered by
// solutions_language = 'Pl'. Session A has two runs (one Guesses, one Forfeit
// with final_score 0 — D2's "N/A" sentinel) so the average is non-trivial.
const ARS_ROWS: ArsRow[] = [
  { runId: RUN_A1, sessionId: SESSION_A, language: "Pl", deathReason: "Guesses", failedOnWord: "KARDA", finalScore: 120, finalStreak: 3, durationSeconds: 240 },
  { runId: RUN_A2, sessionId: SESSION_A, language: "Pl", deathReason: "Forfeit", failedOnWord: "N/A",  finalScore: 0,   finalStreak: 0, durationSeconds: 60  },
  { runId: RUN_B1, sessionId: SESSION_B, language: "Pl", deathReason: "Guesses", failedOnWord: "ASTRA", finalScore: 80,  finalStreak: 1, durationSeconds: 180 },
  { runId: EN_RUN, sessionId: EN_SESSION, language: "En", deathReason: "Guesses", failedOnWord: "BLIMP", finalScore: 50,  finalStreak: 2, durationSeconds: 90  },
];

// Run_word_event rows: session A's runs both have 2 rwe rows each (so the join
// join shows the A1 column qualification — A1 added rwe. prefixes after the
// global CTE was unqualified). The personal-A rwe rows are 3 + 5 (avg 4); run
// B1 has a single rwe row of 2 (avg 2, contributes to global only).
const RWE_ROWS: RweRow[] = [
  { runId: RUN_A1, language: "Pl", theSecretWord: "KARDA", guessedTurn: 3, timeSeconds: 60 },
  { runId: RUN_A1, language: "Pl", theSecretWord: "KARDA", guessedTurn: 5, timeSeconds: 120 },
  { runId: RUN_A2, language: "Pl", theSecretWord: "ASTRA", guessedTurn: 1, timeSeconds: 30 },
  { runId: RUN_B1, language: "Pl", theSecretWord: "ASTRA", guessedTurn: 2, timeSeconds: 90 },
  { runId: EN_RUN, language: "En", theSecretWord: "BLIMP", guessedTurn: 6, timeSeconds: 200 },
];

const seedFixture = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;
  yield* sql.unsafe(DDL);
  for (const row of ARS_ROWS) {
    yield* sql`
      INSERT INTO arcade_run_summary
        (run_id, session_id, solutions_language, death_reason, failed_on_word, final_score, final_streak, duration_seconds)
      VALUES
        (${row.runId}, ${row.sessionId}, ${row.language}, ${row.deathReason}, ${row.failedOnWord}, ${row.finalScore}, ${row.finalStreak}, ${row.durationSeconds})
    `;
  }
  for (const row of RWE_ROWS) {
    yield* sql`
      INSERT INTO run_word_event (run_id, solutions_language, the_secret_word, guessed_turn, time_seconds)
      VALUES (${row.runId}, ${row.language}, ${row.theSecretWord}, ${row.guessedTurn}, ${row.timeSeconds})
    `;
  }
});

const makeRequest = (
  sessionId: string,
  statColumn: "guessedTurn" | "finalScore",
  statTable: "runWordEvent" | "arcadeRunSummary"
): AnyAvgStatArgs =>
  Schema.decodeSync(AnyAvgStatArgs)({
    sessionId,
    solutionsLanguage: "Pl",
    statColumn,
    statTable,
  });

const TestLayer = PgContainer.ClientLive;

describe("any-avg-stat e2e", () => {
  it.layer(TestLayer, { timeout: "120 seconds" })("A1 column qualification + A8 scalar subquery + B5 findOne", (it) => {
    it.effect("runWordEvent branch: joins rwe through ars.session_id and aggregates guessedTurn across Pl sessions", () =>
      Effect.gen(function* () {
        const sql = yield* SqlClient.SqlClient;
        yield* seedFixture;

        // A1: the runWordEvent branch qualifies both CTEs with rwe./ars. —
        // confirms the join resolves without ambiguity.
        // A8: scalar subqueries -> single outer row.
        // B5: findOne returns that row directly (no array wrapper).
        // Personal (session A, joined via ars.session_id): rwe rows 3,5 (RUN_A1)
        // + 1 (RUN_A2) -> avg = (3+5+1)/3 ≈ 3.0 -> ROUND -> 3.
        // Global (all Pl rows): 3,5,1 (A) + 2 (B) -> avg = 11/4 = 2.75 -> ROUND -> 3.
        const result = yield* anyAvgStatQuery(sql)(makeRequest(SESSION_A, "guessedTurn", "runWordEvent"));

        expect(result.personal).toBe(3);
        expect(result.global).toBe(3);
      }));

    it.effect("arcadeRunSummary branch: averages final_score without a join", () =>
      Effect.gen(function* () {
        const sql = yield* SqlClient.SqlClient;
        yield* seedFixture;

        // Personal (session A): runs 120 (RUN_A1) + 0 (RUN_A2 Forfeit) -> 60.
        // Global (A + B, En excluded): 120 + 0 + 80 = 200 -> 66.67 -> ROUND -> 67.
        const result = yield* anyAvgStatQuery(sql)(makeRequest(SESSION_A, "finalScore", "arcadeRunSummary"));

        expect(result.personal).toBe(60);
        expect(result.global).toBe(67);
      }));

    it.effect("findOne succeeds with the COALESCE-materialised scalar row when the session is unmatched", () =>
      // B5 / F3 contract check: an unmatched session still gets one row back.
      // personal subquery: no rows for the zero-UUID session -> AVG(NULL) ->
      // COALESCE -> 0. global subquery: filters En rows, finds the En fixture
      // (RUN_EN, final_score 50) -> AVG(50) = 50. The contract under test is
      // "findOne returns a row without throwing NoSuchElementError", not
      // "(0, 0)" specifically — global-side aggregation depends on what the
      // solutionsLanguage filter matches, which here is the En fixture row.
      Effect.gen(function* () {
        const sql = yield* SqlClient.SqlClient;
        yield* seedFixture;

        const request = yield* Schema.decodeEffect(AnyAvgStatArgs)({
          sessionId: "00000000-0000-0000-0000-000000000000",
          solutionsLanguage: "En",
          statColumn: "finalScore",
          statTable: "arcadeRunSummary",
        });
        const result = yield* anyAvgStatQuery(sql)(request);

        expect(result.personal).toBe(0);
        expect(result.global).toBe(50);
      }));
  });
});
