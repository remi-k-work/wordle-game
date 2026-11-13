import { describe, expect, it } from "@effect/vitest";
import { Effect, Layer, Schema } from "effect";
import { SqlClient } from "effect/sql";
import { ChartsDB } from "@/features/charts/services/charts-db";
import { AnyChartArgs } from "@/features/charts/domain/models";
import { guessDistributionQuery } from "@/features/charts/queries/guess-distribution";
import { PgContainer } from "./_pg-container";
import { EN_INSTANCE, EN_SESSION, INSTANCE_A1, INSTANCE_B1, SESSION_A, SESSION_B, seedGlobalPulse, type GlobalPulseRow } from "./_pg-fixtures";

// Two Pl sessions (A = personal, B = other player) + one En row that must be
// filtered out by solutions_language = 'Pl'. Each payload is the full producer
// shape (max/min/sum/count/buckets) — the query reads metric_payload->'buckets'.
// Each bucket array is cumulative within its own metric pulse (D1).
const FIXTURE_ROWS: ReadonlyArray<GlobalPulseRow> = [
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

const seedFixture = seedGlobalPulse(FIXTURE_ROWS);

// SqlSchema validates the Request via Schema — a plain object fails the
// class's encode step, so build the request through the schema first.
const makeRequest = (sessionId: string): AnyChartArgs => Schema.decodeSync(AnyChartArgs)({ sessionId, solutionsLanguage: "Pl" });

// The same service graph the production RPC handler builds (ChartsDB over
// SqlClient), only with the driver swapped for the test container. Providing
// ChartsDB here is what lets the last test drive the real pipeline — the
// dropNull filter, the strict array decode and the `dieOnDbFailure`
// escalation — instead of re-implementing it inline
const ChartsDBLive = ChartsDB.layer.pipe(Layer.provideMerge(PgContainer.ClientLive));

describe("guess-distribution e2e", () => {
  it.layer(ChartsDBLive, { timeout: "120 seconds" })("A3 sentinel pattern", (it) => {
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

    // The service-level view of the same data: `cumulativeToDistribution` runs
    // against the trailing row as the percentage denominator, the NULL row is
    // dropped because guesses-per-win has a closed 1..MAX_TURNS range, and the
    // result is decoded against the strict schema
    it.effect("through ChartsDB derives discrete percentages and drops the NULL row", () =>
      Effect.gen(function* () {
        const chartsDB = yield* ChartsDB;
        yield* seedFixture;

        const decoded = yield* chartsDB.getGuessDistribution(makeRequest(SESSION_A));

        // NULL row hidden by the DB layer — only 6 turn rows reach the UI.
        expect(decoded.length).toBe(6);
        expect(decoded.map((r) => r.turn)).toEqual([1, 2, 3, 4, 5, 6]);

        // personal total = 3, global total = 5 (from the trailing row).
        expect(decoded.map((r) => r.personalPct)).toEqual([67, 33, 0, 0, 0, 0]);
        expect(decoded.map((r) => r.globalPct)).toEqual([60, 20, 0, 0, 0, 20]);
      })
    );
  });
});
