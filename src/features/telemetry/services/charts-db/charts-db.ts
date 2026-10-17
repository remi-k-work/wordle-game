// services, features, and other libraries
import { Context, Effect, Layer, Schema } from "effect";
import { SqlClient } from "effect/sql";
import { AnyChartArgs, ArcadeStreakDistributionData, GuessDistributionData, TimeToSolveDistributionData } from "./models";
import { cumulativeToDistribution } from "./helpers";
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

export class ChartsDB extends Context.Service<ChartsDB>()("ChartsDB", {
  // Error-escalation policy (E5): every chart query escalates both SchemaError
  // and SqlError to defects (Effect.die) — the query factories do this via
  // Effect.tapError(Effect.logError) + Effect.catchTags({...}), and the
  // histogram methods below do it via Effect.orDie after the strict schema
  // decode. There is no per-chart graceful degradation; all failures become
  // RPC 500s. This is intentional and uniform across every method here —
  // telemetry charts are best-effort. Do NOT introduce per-chart catch
  // branches that disagree with this policy.
  make: Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient;

    const getGuessDistribution = (request: AnyChartArgs) =>
      Effect.gen(function* () {
        const rows = yield* guessDistributionQuery(sql)(request);

        const chartData = cumulativeToDistribution(rows, (row, personal, global, personalPct, globalPct) => ({
          turn: row.turn,
          personal,
          global,
          personalPct,
          globalPct,
        })).filter((row) => row.turn !== null);

        // Decode against the strict schema, as recommended for final domain mapping
        return yield* Schema.decodeEffect(Schema.Array(GuessDistributionData))(chartData).pipe(Effect.orDie);
      });

    const getTimeToSolveDistribution = (request: AnyChartArgs) =>
      Effect.gen(function* () {
        const rows = yield* timeToSolveDistributionQuery(sql)(request);

        const chartData = cumulativeToDistribution(rows, (row, personal, global, personalPct, globalPct) => ({
          maxSeconds: row.maxSeconds,
          personal,
          global,
          personalPct,
          globalPct,
        }));

        // Decode against the strict schema, as recommended for final domain mapping
        return yield* Schema.decodeEffect(Schema.Array(TimeToSolveDistributionData))(chartData).pipe(Effect.orDie);
      });

    const getArcadeStreakDistribution = (request: AnyChartArgs) =>
      Effect.gen(function* () {
        const rows = yield* arcadeStreakDistributionQuery(sql)(request);

        const chartData = cumulativeToDistribution(rows, (row, personal, global, personalPct, globalPct) => ({
          streak: row.streak,
          personal,
          global,
          personalPct,
          globalPct,
        }));

        // Decode against the strict schema, as recommended for final domain mapping
        return yield* Schema.decodeEffect(Schema.Array(ArcadeStreakDistributionData))(chartData).pipe(Effect.orDie);
      });

    const getOpeningGuessesFrequency = openingGuessesFrequencyQuery(sql);
    const getFailedWordsFrequency = failedWordsFrequencyQuery(sql);
    const getRunDeathReasonFrequency = runDeathReasonFrequencyQuery(sql);
    const getAnyCounter = anyCounterQuery(sql);
    const getAnyAvgStat = anyAvgStatQuery(sql);
    const getHardestWordsLeaderboard = hardestWordsLeaderboardQuery(sql);
    const getBestRunTrophyCard = bestRunTrophyCardQuery(sql);

    return {
      getGuessDistribution,
      getTimeToSolveDistribution,
      getArcadeStreakDistribution,
      getOpeningGuessesFrequency,
      getFailedWordsFrequency,
      getRunDeathReasonFrequency,
      getAnyCounter,
      getAnyAvgStat,
      getHardestWordsLeaderboard,
      getBestRunTrophyCard,
    } as const;
  }),
}) {
  static readonly layer = Layer.effect(this, this.make);
}
