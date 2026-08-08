import { describe, expect, it } from "@effect/vitest";
import { Effect, Schema } from "effect";
import { SqlClient } from "effect/unstable/sql";
import { PgContainer } from "./_pg-container";
import { AnyCounterArgs, anyCounterQuery } from "@/features/telemetry/services/charts-db";

// Minimal slice of init-telemetry.sql — only the global_pulse table, since the
// any-counter query touches nothing else. Mirrors production DDL.
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
const INSTANCE_A2 = "3234aa66-a5e7-4ae8-8d9f-256209299fdf";
const INSTANCE_B1 = "89925de3-c13b-4f8a-9a03-5a89c67f9418";
const EN_INSTANCE = "3f76a487-99df-41d2-8ae7-6fb58d87d488";

// Two Pl sessions (A = personal with two pulses, B = other player) + one En
// row that must be filtered out by solutions_language = 'Pl'. Counter
// payloads use the producer's {"count": N, "incremental": true} shape.
const FIXTURE_ROWS: Array<{
  sessionId: string;
  instanceId: string;
  language: "Pl" | "En";
  metric: "validGuesses";
  payload: string;
}> = [
  {
    sessionId: SESSION_A,
    instanceId: INSTANCE_A1,
    language: "Pl",
    metric: "validGuesses",
    payload: '{"count":14,"incremental":true}',
  },
  {
    sessionId: SESSION_A,
    instanceId: INSTANCE_A2,
    language: "Pl",
    metric: "validGuesses",
    payload: '{"count":35,"incremental":true}',
  },
  {
    sessionId: SESSION_B,
    instanceId: INSTANCE_B1,
    language: "Pl",
    metric: "validGuesses",
    payload: '{"count":3,"incremental":true}',
  },
  {
    sessionId: EN_SESSION,
    instanceId: EN_INSTANCE,
    language: "En",
    metric: "validGuesses",
    payload: '{"count":5,"incremental":true}',
  },
];

const seedFixture = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;
  // sql.unsafe — DDL cannot be a bound parameter ($1).
  yield* sql.unsafe(GLOBAL_PULSE_DDL);
  for (const row of FIXTURE_ROWS) {
    yield* sql`
      INSERT INTO global_pulse (session_id, instance_id, solutions_language, metric_name, metric_payload)
      VALUES (${row.sessionId}, ${row.instanceId}, ${row.language}, ${row.metric}, ${row.payload}::jsonb)
    `;
  }
});

// SqlSchema validates the Request via Schema — build it through the schema.
const makeRequest = (sessionId: string): typeof AnyCounterArgs.Type =>
  Schema.decodeUnknownSync(AnyCounterArgs)({ sessionId, solutionsLanguage: "Pl", counterName: "validGuesses" });

const TestLayer = PgContainer.ClientLive;

describe("any-counter e2e", () => {
  it.layer(TestLayer, { timeout: "120 seconds" })("A7 ::bigint cast", (it) => {
    it.effect("sums personal and global counts across Pl sessions and excludes En (A7 ::bigint cast)", () =>
      Effect.gen(function* () {
        const sql = yield* SqlClient.SqlClient;
        yield* seedFixture;

        const rows = yield* anyCounterQuery(sql)(makeRequest(SESSION_A));

        // findAll returns an Array; the CROSS JOIN of two scalar CTEs yields
        // exactly one row. personal = session A (14 + 35 = 49); global = A + B
        // (49 + 3 = 52); the En row (count 5) is excluded by the language filter.
        expect(rows.length).toBe(1);
        expect(rows[0].personal).toBe(49);
        expect(rows[0].global).toBe(52);
      })
    );

    it.effect("returns 0/0 when no rows match (COALESCE materialises the scalar row)", () =>
      Effect.gen(function* () {
        const sql = yield* SqlClient.SqlClient;
        yield* seedFixture;

        // A session with no validGuesses rows — both CTEs sum over an empty
        // set; COALESCE(0) gives the single (0, 0) row.
        const rows = yield* anyCounterQuery(sql)(makeRequest(SESSION_B.replace(/^04/, "ab")));

        expect(rows.length).toBe(1);
        expect(rows[0].personal).toBe(0);
        expect(rows[0].global).toBe(52);
      })
    );
  });
});
