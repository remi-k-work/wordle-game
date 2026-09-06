import { describe, expect, it } from "@effect/vitest";
import { Effect, Schema } from "effect";
import { SqlClient } from "effect/unstable/sql";
import { PgContainer } from "./_pg-container";
import { AnyChartArgs, openingGuessesFrequencyQuery } from "@/features/telemetry/services/charts-db";

// Minimal slice of init-telemetry.sql — only the global_pulse table, since the
// word-frequency query touches nothing else. Mirrors production DDL.
const GLOBAL_PULSE_DDL = `
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

const SESSION_A = "829087ad-9e88-46f9-9f45-174c3bc9e046";
const SESSION_B = "044a83ea-9fa8-415a-8186-28baaf86657d";
const EN_SESSION = "80633be7-9d66-4d70-935e-fb031eeb3628";
const INSTANCE_A1 = "9808cf3c-8d89-499d-b4a6-1246a068dae4";
const INSTANCE_B1 = "89925de3-c13b-4f8a-9a03-5a89c67f9418";
const EN_INSTANCE = "3f76a487-99df-41d2-8ae7-6fb58d87d488";

// Two Pl sessions (A = personal, B = other player sharing word ASTRA) + one En
// row (excluded by solutions_language = 'Pl'). Payloads use the producer's
// {"occurrences": {"WORD": N}} shape. SQL expands via LATERAL jsonb_each_text
// and aggregates per UPPER(kv.key) — backing the makeWordFrequencyQuery factory.
const FIXTURE_ROWS: Array<{
  sessionId: string;
  instanceId: string;
  language: "Pl" | "En";
  metric: "openingGuesses";
  payload: string;
}> = [
  {
    sessionId: SESSION_A,
    instanceId: INSTANCE_A1,
    language: "Pl",
    metric: "openingGuesses",
    payload: '{"occurrences":{"GRAMY":2,"ASTRA":1}}',
  },
  {
    sessionId: SESSION_B,
    instanceId: INSTANCE_B1,
    language: "Pl",
    metric: "openingGuesses",
    payload: '{"occurrences":{"ASTRA":1}}',
  },
  {
    sessionId: EN_SESSION,
    instanceId: EN_INSTANCE,
    language: "En",
    metric: "openingGuesses",
    payload: '{"occurrences":{"BLIMP":1}}',
  },
];

const seedFixture = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;
  yield* sql.unsafe(GLOBAL_PULSE_DDL);
  for (const row of FIXTURE_ROWS) {
    yield* sql`
      INSERT INTO global_pulse (session_id, instance_id, solutions_language, metric_name, metric_payload)
      VALUES (${row.sessionId}, ${row.instanceId}, ${row.language}, ${row.metric}, ${row.payload}::jsonb)
    `;
  }
});

const makeRequest = (sessionId: string): AnyChartArgs =>
  Schema.decodeSync(AnyChartArgs)({ sessionId, solutionsLanguage: "Pl" });

const TestLayer = PgContainer.ClientLive;

describe("opening-guesses frequency e2e", () => {
  it.layer(TestLayer, { timeout: "120 seconds" })("B1 makeWordFrequencyQuery", (it) => {
    it.effect("aggregates per-word personal vs global across Pl sessions and excludes En", () =>
      Effect.gen(function* () {
        const sql = yield* SqlClient.SqlClient;
        yield* seedFixture;

        const rows = yield* openingGuessesFrequencyQuery(sql)(makeRequest(SESSION_A));

        // GRAMY: personal(A)=2, global(A+B)=2 (En excluded). ASTRA: personal(A)=1,
        // global(A+B)=2. BLIMP lives only in the En row → filtered out entirely.
        // Order: both have personal>0 (rank 1); global ties at 2; tie-break by
        // personal DESC → GRAMY(2) before ASTRA(1); then word ASC.
        expect(rows.map((r) => ({ word: r.word, personal: r.personal, global: r.global }))).toEqual([
          { word: "GRAMY", personal: 2, global: 2 },
          { word: "ASTRA", personal: 1, global: 2 },
        ]);
      }));

    it.effect("surfaces global-only words with personal=0 for a session that didn't emit them", () =>
      Effect.gen(function* () {
        const sql = yield* SqlClient.SqlClient;
        yield* seedFixture;

        // Session B emitted ASTRA only; GRAMY is global-only with personal=0.
        const rows = yield* openingGuessesFrequencyQuery(sql)(makeRequest(SESSION_B));

        expect(rows.map((r) => ({ word: r.word, personal: r.personal, global: r.global }))).toEqual([
          { word: "ASTRA", personal: 1, global: 2 },
          { word: "GRAMY", personal: 0, global: 2 },
        ]);
      }));
  });
});
