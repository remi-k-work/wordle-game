// services, features, and other libraries
import { describe, expect, it } from "@effect/vitest";
import { Effect, Exit } from "effect";
import { ChartsDB } from "@/features/charts/services/charts-db";
import { AnyChartArgs, AnyCounterArgs, GuessDistributionData } from "@/features/charts/domain/models";

// The in-memory layer answers only the queries a test supplies. These tests pin
// both halves: a supplied fixture is returned unchanged, and an unsupplied query
// fails loudly instead of silently reporting empty data.

const SESSION_ID = "3f2504e0-4f89-41d3-9a0c-0305e82c3301";

const chartArgs = new AnyChartArgs({ sessionId: SESSION_ID, solutionsLanguage: "En" });

describe("ChartsDB.layerTest", () => {
  it.effect("serves the supplied fixture for a query", () =>
    Effect.gen(function* () {
      const db = yield* ChartsDB;
      const rows = yield* db.getGuessDistribution(chartArgs);

      expect(rows).toStrictEqual([new GuessDistributionData({ personal: 2, global: 5, turn: 3 })]);
    }).pipe(
      Effect.provide(
        ChartsDB.layerTest({
          getGuessDistribution: () => Effect.succeed([new GuessDistributionData({ personal: 2, global: 5, turn: 3 })]),
        })
      )
    )
  );

  it.effect("fails loudly when a query has no fixture", () =>
    Effect.gen(function* () {
      const db = yield* ChartsDB;
      const exit = yield* Effect.exit(
        db.getAnyCounter(new AnyCounterArgs({ sessionId: SESSION_ID, solutionsLanguage: "En", counterName: "gamesPlayed" }))
      );

      expect(Exit.isFailure(exit)).toBe(true);
    }).pipe(Effect.provide(ChartsDB.layerTest({ getGuessDistribution: () => Effect.succeed([]) })))
  );
});
