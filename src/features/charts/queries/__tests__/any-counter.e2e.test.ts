import { describe, expect, it } from "@effect/vitest";
import { Effect, Schema } from "effect";
import { SqlClient } from "effect/sql";
import { PgContainer } from "./_pg-container";
import {
  EN_INSTANCE,
  EN_SESSION,
  INSTANCE_A1,
  INSTANCE_A2,
  INSTANCE_B1,
  SESSION_A,
  SESSION_B,
  UNKNOWN_SESSION,
  seedGlobalPulse,
  type GlobalPulseRow,
} from "./_pg-fixtures";
import { AnyCounterArgs } from "@/features/charts/domain/models";
import { anyCounterQuery } from "@/features/charts/queries/any-counter";

// Two Pl sessions (A = personal with two pulses, B = other player) + one En
// row that must be filtered out by solutions_language = 'Pl'. Counter
// payloads use the producer's {"count": N, "incremental": true} shape.
const FIXTURE_ROWS: ReadonlyArray<GlobalPulseRow> = [
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

const seedFixture = seedGlobalPulse(FIXTURE_ROWS);

// SqlSchema validates the Request via Schema — build it through the schema.
const makeRequest = (sessionId: string): AnyCounterArgs =>
  Schema.decodeSync(AnyCounterArgs)({ sessionId, solutionsLanguage: "Pl", counterName: "validGuesses" });

const TestLayer = PgContainer.ClientLive;

describe("any-counter e2e", () => {
  it.layer(TestLayer, { timeout: "120 seconds" })("A7 ::bigint cast + A8 scalar subquery + B5 findOne", (it) => {
    it.effect("sums personal and global counts across Pl sessions and excludes En", () =>
      Effect.gen(function* () {
        const sql = yield* SqlClient.SqlClient;
        yield* seedFixture;

        const result = yield* anyCounterQuery(sql)(makeRequest(SESSION_A));

        // A8: scalar subqueries (not CROSS JOIN) — the outer SELECT produces
        // exactly one row. B5: SqlSchema.findOne returns the row directly (not
        // an array). personal = session A (14 + 35 = 49); global = A + B
        // (49 + 3 = 52); the En row (count 5) is excluded by the language filter.
        expect(result.personal).toBe(49);
        expect(result.global).toBe(52);
      })
    );

    it.effect("returns 0 personal when the session matches no rows (global still aggregates matched rows)", () =>
      Effect.gen(function* () {
        const sql = yield* SqlClient.SqlClient;
        yield* seedFixture;

        // A nonexistent Pl session — the personal scalar subquery hits nothing
        // (SUM over empty -> NULL -> COALESCE -> 0), but the global subquery
        // still aggregates the matched Pl rows (A + B = 52). COALESCE
        // materialises the single (0, 52) row, so findOne succeeds
        // (NoSuchElementError is unreachable, per the F3 comment).
        const result = yield* anyCounterQuery(sql)(makeRequest(UNKNOWN_SESSION));

        expect(result.personal).toBe(0);
        expect(result.global).toBe(52);
      })
    );

    it.effect("findOne succeeds with the COALESCE-materialised scalar row when the session is unmatched", () =>
      // B5 contract check: confirm findOne does not throw NoSuchElementError
      // when the personal subquery matches nothing — COALESCE(NULL, 0) still
      // materialises the single scalar row. The global subquery still sees
      // the En fixture row (count=5) via the solutions_language filter, so global
      // is 5 here — the contract under test is "findOne returns a row", not
      // "(0, 0)" specifically.
      Effect.gen(function* () {
        const sql = yield* SqlClient.SqlClient;
        yield* seedFixture;

        // Unmatched session, En language. personal subquery: no rows for the
        // zero-UUID session -> SUM -> NULL -> COALESCE -> 0. global subquery:
        // filters En rows, finds the En fixture (count 5) -> 5.
        const request = yield* Schema.decodeEffect(AnyCounterArgs)({
          sessionId: "00000000-0000-0000-0000-000000000000",
          solutionsLanguage: "En",
          counterName: "validGuesses",
        });
        const result = yield* anyCounterQuery(sql)(request);

        expect(result.personal).toBe(0);
        expect(result.global).toBe(5);
      })
    );
  });
});
