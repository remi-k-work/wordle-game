import { describe, expect, it } from "@effect/vitest";
import { Effect, Option, Schema } from "effect";
import { SqlClient } from "effect/sql";
import { PgContainer } from "./_pg-container";
import { EN_SESSION, SESSION_A, SESSION_B, seedRunTables, type RunSummaryRow } from "./_pg-fixtures";
import { BestRunTrophyCardArgs } from "@/features/charts/domain/models";
import { bestRunTrophyCardQuery } from "@/features/charts/queries/best-run-trophy-card";

// Three runs:
// - SESSION_A (Pl): score 500, streak 3, Forfeit, failedOnWord "N/A" (personal best)
// - SESSION_B (Pl): score 800, streak 5, Guesses, failedOnWord "WORDS" (global best)
// - EN_SESSION (En): score 1000, streak 10, Guesses, failedOnWord "WORDS" (must be language-filtered)
const FIXTURE_ROWS: ReadonlyArray<RunSummaryRow> = [
  {
    runId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    sessionId: SESSION_A,
    language: "Pl",
    deathReason: "Forfeit",
    failedOnWord: "N/A",
    finalScore: 500,
    finalStreak: 3,
    durationSeconds: 60,
  },
  {
    runId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    sessionId: SESSION_B,
    language: "Pl",
    deathReason: "Guesses",
    failedOnWord: "WORDS",
    finalScore: 800,
    finalStreak: 5,
    durationSeconds: 120,
  },
  {
    runId: "cccccccc-cccc-cccc-cccc-cccccccccccc",
    sessionId: EN_SESSION,
    language: "En",
    deathReason: "Guesses",
    failedOnWord: "WORDS",
    finalScore: 1000,
    finalStreak: 10,
    durationSeconds: 180,
  },
];

const seedFixture = seedRunTables(FIXTURE_ROWS, []);

const makeRequest = (sessionId: string, whichBestRun: "personal" | "global"): BestRunTrophyCardArgs =>
  Schema.decodeSync(BestRunTrophyCardArgs)({ sessionId, solutionsLanguage: "Pl", whichBestRun });

const TestLayer = PgContainer.ClientLive;

describe("best-run-trophy-card e2e", () => {
  it.layer(TestLayer, { timeout: "120 seconds" })("best-run-trophy-card query", (it) => {
    it.effect("personal mode returns the session's top run (ordered by score/streak/created_at) and filters language", () =>
      Effect.gen(function* () {
        const sql = yield* SqlClient.SqlClient;
        yield* seedFixture;

        const result = yield* bestRunTrophyCardQuery(sql)(makeRequest(SESSION_A, "personal"));

        // Session A has one run (score 500). Session B has higher score (800) but is a different session.
        // The EN row is excluded by language filter.
        // `getOrThrow` over the `isSome` guard + nested assertions: the earlier
        // shape asserted twice and then re-read the unwrapped value by hand
        const bestRun = Option.getOrThrow(result);
        expect(bestRun.finalScore).toBe(500);
        expect(bestRun.finalStreak).toBe(3);
        expect(bestRun.deathReason).toBe("Forfeit");
        expect(bestRun.failedOnWord).toBe("N/A");
      })
    );

    it.effect("global mode ignores session_id and returns the overall best run, still language-filtered", () =>
      Effect.gen(function* () {
        const sql = yield* SqlClient.SqlClient;
        yield* seedFixture;

        const result = yield* bestRunTrophyCardQuery(sql)(makeRequest(SESSION_A, "global"));

        // Global mode considers all Pl sessions; Session B has score 800 > Session A's 500.
        // The EN row (score 1000) is excluded by language filter.
        const bestRun = Option.getOrThrow(result);
        expect(bestRun.finalScore).toBe(800);
        expect(bestRun.finalStreak).toBe(5);
        expect(bestRun.deathReason).toBe("Guesses");
        expect(bestRun.failedOnWord).toBe("WORDS");
      })
    );

    it.effect("returns None when no rows match the language filter", () =>
      Effect.gen(function* () {
        const sql = yield* SqlClient.SqlClient;
        yield* seedFixture;

        // Empty the table so the global lookup genuinely has no candidates
        yield* sql`DELETE FROM arcade_run_summary`;

        const request = yield* Schema.decodeEffect(BestRunTrophyCardArgs)({
          sessionId: "00000000-0000-0000-0000-000000000000",
          solutionsLanguage: "En",
          whichBestRun: "global",
        });
        const result = yield* bestRunTrophyCardQuery(sql)(request);

        expect(Option.isNone(result)).toBe(true);
      })
    );
  });
});
