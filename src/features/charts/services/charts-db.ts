// services, features, and other libraries
import { Array, Context, Effect, Layer, Option, Schema } from "effect";
import { SqlClient } from "effect/sql";
import {
  AnyChartArgs,
  AnyCounterArgs,
  AnyCounterData,
  AnyAvgStatArgs,
  ArcadeStreakDistributionData,
  BestRunTrophyCardArgs,
  BestRunTrophyCardData,
  FailedWordsFrequencyData,
  GuessDistributionData,
  HardestWordsLeaderboardData,
  OpeningGuessesFrequencyData,
  RunDeathReasonFrequencyData,
  TimeToSolveDistributionData,
} from "@/features/charts/domain/models";
import { cumulativeToDistribution } from "@/features/charts/domain/helpers";
import { dieOnDbFailure } from "@/domain/helpers";
import { anyAvgStatQuery } from "@/features/charts/queries/any-avg-stat";
import { anyCounterQuery } from "@/features/charts/queries/any-counter";
import { arcadeStreakDistributionQuery } from "@/features/charts/queries/arcade-streak-distribution";
import { bestRunTrophyCardQuery } from "@/features/charts/queries/best-run-trophy-card";
import { failedWordsFrequencyQuery } from "@/features/charts/queries/failed-words-frequency";
import { guessDistributionQuery } from "@/features/charts/queries/guess-distribution";
import { hardestWordsLeaderboardQuery } from "@/features/charts/queries/hardest-words-leaderboard";
import { openingGuessesFrequencyQuery } from "@/features/charts/queries/opening-guesses-frequency";
import { runDeathReasonFrequencyQuery } from "@/features/charts/queries/run-death-reason-frequency";
import { timeToSolveDistributionQuery } from "@/features/charts/queries/time-to-solve-distribution";

// types
import type { BucketKey } from "@/features/charts/domain/helpers";

// The service shape: every chart query as a typed method returning a defect-free Effect
// (dieOnDbFailure has already converted all typed errors to defects at the query boundary).
// Kept private: consumers reach it structurally (or via `Context.Service.Shape<typeof ChartsDB>`)
interface ChartsDBShape {
  readonly getGuessDistribution: (request: AnyChartArgs) => Effect.Effect<ReadonlyArray<GuessDistributionData>>;
  readonly getTimeToSolveDistribution: (request: AnyChartArgs) => Effect.Effect<ReadonlyArray<TimeToSolveDistributionData>>;
  readonly getArcadeStreakDistribution: (request: AnyChartArgs) => Effect.Effect<ReadonlyArray<ArcadeStreakDistributionData>>;
  readonly getOpeningGuessesFrequency: (request: AnyChartArgs) => Effect.Effect<ReadonlyArray<OpeningGuessesFrequencyData>>;
  readonly getFailedWordsFrequency: (request: AnyChartArgs) => Effect.Effect<ReadonlyArray<FailedWordsFrequencyData>>;
  readonly getRunDeathReasonFrequency: (request: AnyChartArgs) => Effect.Effect<ReadonlyArray<RunDeathReasonFrequencyData>>;
  readonly getAnyCounter: (request: AnyCounterArgs) => Effect.Effect<AnyCounterData>;
  readonly getAnyAvgStat: (request: AnyAvgStatArgs) => Effect.Effect<AnyCounterData>;
  readonly getHardestWordsLeaderboard: (request: AnyChartArgs) => Effect.Effect<ReadonlyArray<HardestWordsLeaderboardData>>;
  readonly getBestRunTrophyCard: (request: BestRunTrophyCardArgs) => Effect.Effect<Option.Option<BestRunTrophyCardData>>;
}

// Schema.decodeEffect builds a parser on every call, so build the array decoders once at module scope instead of per request
const decodeGuessDistributionData = Schema.decodeEffect(Schema.Array(GuessDistributionData));
const decodeTimeToSolveDistributionData = Schema.decodeEffect(Schema.Array(TimeToSolveDistributionData));
const decodeArcadeStreakDistributionData = Schema.decodeEffect(Schema.Array(ArcadeStreakDistributionData));

export class ChartsDB extends Context.Service<ChartsDB, ChartsDBShape>()("ChartsDB") {
  static readonly layer = Layer.effect(
    ChartsDB,
    Effect.gen(function* () {
      const sql = yield* SqlClient.SqlClient;

      // Each query factory builds a `SqlSchema`, so the factories are hoisted and built once per layer instead of once per request
      const guessDistributionQueryFn = guessDistributionQuery(sql);
      const timeToSolveDistributionQueryFn = timeToSolveDistributionQuery(sql);
      const arcadeStreakDistributionQueryFn = arcadeStreakDistributionQuery(sql);
      const openingGuessesFrequencyQueryFn = openingGuessesFrequencyQuery(sql);
      const failedWordsFrequencyQueryFn = failedWordsFrequencyQuery(sql);
      const runDeathReasonFrequencyQueryFn = runDeathReasonFrequencyQuery(sql);
      const anyCounterQueryFn = anyCounterQuery(sql);
      const anyAvgStatQueryFn = anyAvgStatQuery(sql);
      const hardestWordsLeaderboardQueryFn = hardestWordsLeaderboardQuery(sql);
      const bestRunTrophyCardQueryFn = bestRunTrophyCardQuery(sql);

      const makeDistributionGetter = <Row extends { readonly personal: number; readonly global: number }, Data>(
        queryFn: (request: AnyChartArgs) => Effect.Effect<ReadonlyArray<Row>, never, never>,
        decodeData: (chartData: ReadonlyArray<Row>) => Effect.Effect<ReadonlyArray<Data>, Schema.SchemaError, never>,
        bucket: { readonly key: BucketKey<Row>; readonly nullBucket: "dropNull" | "keepNull" }
      ) =>
        Effect.fnUntraced(function* (request: AnyChartArgs) {
          const rows = yield* queryFn(request);

          // Re-broadcast the row (so its bucket column survives) with the derived discrete counts and percentages in place of the cumulative ones
          const chartData = cumulativeToDistribution(rows, (row, personal, global, personalPct, globalPct) => ({
            ...row,
            personal,
            global,
            personalPct,
            globalPct,
          }));

          // Decode against the strict schema, as recommended for final domain mapping
          return yield* decodeData(bucket.nullBucket === "dropNull" ? Array.filter(chartData, (row) => row[bucket.key] !== null) : chartData).pipe(
            dieOnDbFailure
          );
        });

      const getGuessDistribution = makeDistributionGetter(guessDistributionQueryFn, decodeGuessDistributionData, { key: "turn", nullBucket: "dropNull" });
      const getTimeToSolveDistribution = makeDistributionGetter(timeToSolveDistributionQueryFn, decodeTimeToSolveDistributionData, {
        key: "maxSeconds",
        nullBucket: "keepNull",
      });
      const getArcadeStreakDistribution = makeDistributionGetter(arcadeStreakDistributionQueryFn, decodeArcadeStreakDistributionData, {
        key: "streak",
        nullBucket: "keepNull",
      });

      return ChartsDB.of({
        getGuessDistribution,
        getTimeToSolveDistribution,
        getArcadeStreakDistribution,
        getOpeningGuessesFrequency: openingGuessesFrequencyQueryFn,
        getFailedWordsFrequency: failedWordsFrequencyQueryFn,
        getRunDeathReasonFrequency: runDeathReasonFrequencyQueryFn,
        getAnyCounter: anyCounterQueryFn,
        getAnyAvgStat: anyAvgStatQueryFn,
        getHardestWordsLeaderboard: hardestWordsLeaderboardQueryFn,
        getBestRunTrophyCard: bestRunTrophyCardQueryFn,
      });
    })
  );

  // Test-only: answers chart calls from the supplied fixtures. A query left out
  // fails loudly (`UnimplementedError`) if it is called, rather than silently
  // returning empty data.
  static readonly layerTest = (fixtures: Partial<ChartsDBShape>) => Layer.mock(ChartsDB, fixtures);
}
