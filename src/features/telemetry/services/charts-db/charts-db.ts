// services, features, and other libraries
import { Context, Effect, Layer, Schema } from "effect";
import { SqlClient } from "effect/sql";
import {
  AnyChartArgs,
  AnyCounterArgs,
  AnyAvgStatArgs,
  ArcadeStreakDistributionData,
  BestRunTrophyCardArgs,
  GuessDistributionData,
  TimeToSolveDistributionData,
} from "./models";
import { cumulativeToDistribution } from "./helpers";
import { dieOnDbFailure } from "@/domain/db-policy";
import { anyAvgStatQuery } from "./queries/any-avg-stat";
import { anyCounterQuery } from "./queries/any-counter";
import { arcadeStreakDistributionQuery } from "./queries/arcade-streak-distribution";
import { bestRunTrophyCardQuery } from "./queries/best-run-trophy-card";
import { failedWordsFrequencyQuery } from "./queries/failed-words-frequency";
import { guessDistributionQuery } from "./queries/guess-distribution";
import { hardestWordsLeaderboardQuery } from "./queries/hardest-words-leaderboard";
import { openingGuessesFrequencyQuery } from "./queries/opening-guesses-frequency";
import { runDeathReasonFrequencyQuery } from "./queries/run-death-reason-frequency";
import { timeToSolveDistributionQuery } from "./queries/time-to-solve-distribution";

// Schema.decodeEffect builds a parser on every call, so build the array
// decoders once at module scope instead of per request
const decodeGuessDistributionData = Schema.decodeEffect(Schema.Array(GuessDistributionData));
const decodeTimeToSolveDistributionData = Schema.decodeEffect(Schema.Array(TimeToSolveDistributionData));
const decodeArcadeStreakDistributionData = Schema.decodeEffect(Schema.Array(ArcadeStreakDistributionData));

export class ChartsDB extends Context.Service<ChartsDB>()("ChartsDB", {
  make: Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient;

    // Each query factory builds a `SqlSchema`, so the factories are hoisted and
    // built once per layer instead of once per request
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

    const getGuessDistribution = Effect.fn("getGuessDistribution")(function* (request: AnyChartArgs) {
      const rows = yield* guessDistributionQueryFn(request);

      const chartData = cumulativeToDistribution(rows, (row, personal, global, personalPct, globalPct) => ({
        turn: row.turn,
        personal,
        global,
        personalPct,
        globalPct,
      })).filter((row) => row.turn !== null);

      // Decode against the strict schema, as recommended for final domain mapping
      return yield* decodeGuessDistributionData(chartData).pipe(dieOnDbFailure);
    });

    const getTimeToSolveDistribution = Effect.fn("getTimeToSolveDistribution")(function* (request: AnyChartArgs) {
      const rows = yield* timeToSolveDistributionQueryFn(request);

      const chartData = cumulativeToDistribution(rows, (row, personal, global, personalPct, globalPct) => ({
        maxSeconds: row.maxSeconds,
        personal,
        global,
        personalPct,
        globalPct,
      }));

      // Decode against the strict schema, as recommended for final domain mapping
      return yield* decodeTimeToSolveDistributionData(chartData).pipe(dieOnDbFailure);
    });

    const getArcadeStreakDistribution = Effect.fn("getArcadeStreakDistribution")(function* (request: AnyChartArgs) {
      const rows = yield* arcadeStreakDistributionQueryFn(request);

      const chartData = cumulativeToDistribution(rows, (row, personal, global, personalPct, globalPct) => ({
        streak: row.streak,
        personal,
        global,
        personalPct,
        globalPct,
      }));

      // Decode against the strict schema, as recommended for final domain mapping
      return yield* decodeArcadeStreakDistributionData(chartData).pipe(dieOnDbFailure);
    });

    // Simple passthroughs to query functions. Referencing the hoisted query
    // directly keeps this layer a thin boundary: the queries already carry the
    // shared `dieOnDbFailure` policy, and there is no logic or tracing value to
    // add here that would justify wrapping each call in its own Effect
    return {
      getGuessDistribution,
      getTimeToSolveDistribution,
      getArcadeStreakDistribution,
      getOpeningGuessesFrequency: (request: AnyChartArgs) => openingGuessesFrequencyQueryFn(request),
      getFailedWordsFrequency: (request: AnyChartArgs) => failedWordsFrequencyQueryFn(request),
      getRunDeathReasonFrequency: (request: AnyChartArgs) => runDeathReasonFrequencyQueryFn(request),
      getAnyCounter: (request: AnyCounterArgs) => anyCounterQueryFn(request),
      getAnyAvgStat: (request: AnyAvgStatArgs) => anyAvgStatQueryFn(request),
      getHardestWordsLeaderboard: (request: AnyChartArgs) => hardestWordsLeaderboardQueryFn(request),
      getBestRunTrophyCard: (request: BestRunTrophyCardArgs) => bestRunTrophyCardQueryFn(request),
    } as const;
  }),
}) {
  static readonly layer = Layer.effect(this, this.make);
}
