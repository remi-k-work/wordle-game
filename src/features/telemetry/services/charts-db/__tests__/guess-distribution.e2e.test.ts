import { describe, expect, it } from "@effect/vitest";
import { Effect, Schema } from "effect";
import { SqlClient } from "effect/unstable/sql";
import { PgContainer } from "./_pg-container";
import { AnyChartArgs, cumulativeToDistribution, GuessDistributionData, guessDistributionQuery } from "@/features/telemetry/services/charts-db";

// Minimal slice of init-telemetry.sql — only the global_pulse table, since the
// guess-distribution query touches nothing else. Mirrors production DDL.
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
const INSTANCE_A1 = "9808cf3c-8d89-499d-b4a6-1246a068dae4";
const INSTANCE_B1 = "89925de3-c13b-4f8a-9a03-5a89c67f9418";
const EN_SESSION = "80633be7-9d66-4d70-935e-fb031eeb3628";
const EN_INSTANCE = "3f76a487-99df-41d2-8ae7-6fb58d87d488";

// Two Pl sessions (A = personal, B = other player) + one En row that must be
// filtered out by solutions_language = 'Pl'. Each payload is the full producer
// shape (max/min/sum/count/buckets) — the query reads metric_payload->'buckets'.
// Each bucket array is cumulative within its own metric pulse (D1).
const FIXTURE_ROWS: Array<{
  sessionId: string;
  instanceId: string;
  language: "Pl" | "En";
  metric: "guessesToWin";
  payload: string;
}> = [
  {
    sessionId: SESSION_A,
    instanceId: INSTANCE_A1,
    language: "Pl",
    metric: "guessesToWin",
    payload: '{"max":6,"min":1,"sum":9,"count":3,"buckets":[[1,2],[2,3],[3,3],[4,3],[5,3],[6,3],[null,3]]}',
  },
  {
    sessionId: SESSION_B,
    instanceId: INSTANCE_B1,
    language: "Pl",
    metric: "guessesToWin",
    payload: '{"max":6,"min":1,"sum":2,"count":2,"buckets":[[1,1],[2,1],[3,1],[4,1],[5,1],[6,2],[null,2]]}',
  },
  {
    sessionId: EN_SESSION,
    instanceId: EN_INSTANCE,
    language: "En",
    metric: "guessesToWin",
    payload: '{"max":6,"min":1,"sum":1,"count":1,"buckets":[[1,1],[2,1],[3,1],[4,1],[5,1],[6,1],[null,1]]}',
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

// SqlSchema validates the Request via Schema — a plain object fails the
// class's encode step, so build the request through the schema first.
const makeRequest = (sessionId: string): AnyChartArgs => Schema.decodeSync(AnyChartArgs)({ sessionId, solutionsLanguage: "Pl" });

// Build the same layer the production service uses, but backed by the test
// container instead of PgLive. guessDistributionQuery only needs SqlClient.
const TestLayer = PgContainer.ClientLive;

describe("guess-distribution e2e", () => {
  it.layer(TestLayer, { timeout: "120 seconds" })("A3 sentinel pattern", (it) => {
    it.effect("survives the trailing NULL bucket (A3) after the schema widening", () =>
      Effect.gen(function* () {
        const sql = yield* SqlClient.SqlClient;
        yield* seedFixture;

        const rows = yield* guessDistributionQuery(sql)(makeRequest(SESSION_A));

        // 7 rows = 6 turns + the trailing [null, N] cumulative row.
        // Before A3 the trailing row was silently dropped (WHERE ... IS NOT NULL
        // + Schema.Int rejecting null). It now survives the sentinel pattern.
        expect(rows.length).toBe(7);
        expect(rows[rows.length - 1].turn).toBeNull();

        // Ordered ascending, NULLS LAST — required by cumulativeToDistribution.
        expect(rows.map((r) => r.turn)).toEqual([1, 2, 3, 4, 5, 6, null]);
      })
    );

    it.effect("aggregates personal vs global across two Pl sessions and excludes En", () =>
      Effect.gen(function* () {
        const sql = yield* SqlClient.SqlClient;
        yield* seedFixture;

        const rows = yield* guessDistributionQuery(sql)(makeRequest(SESSION_A));

        // personal = session A cumulative; global = SUM(A, B) cumulative per turn.
        expect(rows.map((r) => ({ turn: r.turn, personal: r.personal, global: r.global }))).toEqual([
          { turn: 1, personal: 2, global: 3 },
          { turn: 2, personal: 3, global: 4 },
          { turn: 3, personal: 3, global: 4 },
          { turn: 4, personal: 3, global: 4 },
          { turn: 5, personal: 3, global: 4 },
          { turn: 6, personal: 3, global: 5 },
          { turn: null, personal: 3, global: 5 },
        ]);
      })
    );

    it.effect("end-to-end cumulativeToDistribution derives correct percentages and hides the NULL row", () =>
      Effect.gen(function* () {
        const sql = yield* SqlClient.SqlClient;
        yield* seedFixture;

        const rows = yield* guessDistributionQuery(sql)(makeRequest(SESSION_A));

        // Mirror charts-db.ts getGuessDistribution: derive percentages against
        // the trailing row, then filter out the NULL row before strict decode.
        const chartData = cumulativeToDistribution(rows, (row, personal, global, personalPct, globalPct) => ({
          turn: row.turn,
          personal,
          global,
          personalPct,
          globalPct,
        })).filter((row) => row.turn !== null);

        const decoded = yield* Schema.decodeEffect(Schema.Array(GuessDistributionData))(chartData).pipe(Effect.orDie);

        // NULL row hidden — only 6 turn rows reach the UI.
        expect(decoded.length).toBe(6);
        expect(decoded.map((r) => r.turn)).toEqual([1, 2, 3, 4, 5, 6]);

        // personal total = 3, global total = 5 (from the trailing row).
        expect(decoded.map((r) => r.personalPct)).toEqual([67, 33, 0, 0, 0, 0]);
        expect(decoded.map((r) => r.globalPct)).toEqual([60, 20, 0, 0, 0, 20]);
      })
    );
  });
});
