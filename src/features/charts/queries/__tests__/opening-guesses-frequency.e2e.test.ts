import { describe, expect, it } from "@effect/vitest";
import { Effect, Schema } from "effect";
import { SqlClient } from "effect/sql";
import { PgContainer } from "./_pg-container";
import { EN_INSTANCE, EN_SESSION, INSTANCE_A1, INSTANCE_B1, SESSION_A, SESSION_B, seedGlobalPulse, type GlobalPulseRow } from "./_pg-fixtures";
import { AnyChartArgs } from "@/features/charts/domain/models";
import { openingGuessesFrequencyQuery } from "@/features/charts/queries/opening-guesses-frequency";

// Two Pl sessions (A = personal, B = other player sharing word ASTRA) + one En
// row (excluded by solutions_language = 'Pl'). Payloads use the producer's
// {"occurrences": {"WORD": N}} shape. SQL expands via LATERAL jsonb_each_text
// and aggregates per UPPER(kv.key) — backing the makeWordFrequencyQuery factory.
const FIXTURE_ROWS: ReadonlyArray<GlobalPulseRow> = [
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

const seedFixture = seedGlobalPulse(FIXTURE_ROWS);

const makeRequest = (sessionId: string): AnyChartArgs => Schema.decodeSync(AnyChartArgs)({ sessionId, solutionsLanguage: "Pl" });

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
      })
    );

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
      })
    );
  });
});
