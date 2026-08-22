// services, features, and other libraries
import { Context, Effect, Layer, Schema } from "effect";
import { SqlClient } from "effect/unstable/sql";
import {
  AnyAvgStatArgs,
  anyAvgStatQuery,
  AnyChartArgs,
  AnyCounterArgs,
  anyCounterQuery,
  ArcadeStreakDistributionData,
  arcadeStreakDistributionQuery,
  BestRunTrophyCardArgs,
  bestRunTrophyCardQuery,
  cumulativeToDistribution,
  failedWordsFrequencyQuery,
  GuessDistributionData,
  guessDistributionQuery,
  hardestWordsLeaderboardQuery,
  openingGuessesFrequencyQuery,
  runDeathReasonFrequencyQuery,
  TimeToSolveDistributionData,
  timeToSolveDistributionQuery,
} from ".";

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
        return yield* Schema.decodeUnknownEffect(Schema.Array(GuessDistributionData))(chartData).pipe(Effect.orDie);
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
        return yield* Schema.decodeUnknownEffect(Schema.Array(TimeToSolveDistributionData))(chartData).pipe(Effect.orDie);
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
        return yield* Schema.decodeUnknownEffect(Schema.Array(ArcadeStreakDistributionData))(chartData).pipe(Effect.orDie);
      });

    const getOpeningGuessesFrequency = openingGuessesFrequencyQuery(sql);
    const getFailedWordsFrequency = failedWordsFrequencyQuery(sql);
    const getRunDeathReasonFrequency = runDeathReasonFrequencyQuery(sql);
    const getAnyCounter = anyCounterQuery(sql);
    const getAnyAvgStat = anyAvgStatQuery(sql);
    const getHardestWordsLeaderboard = hardestWordsLeaderboardQuery(sql);
    const getBestRunTrophyCard = bestRunTrophyCardQuery(sql);

    return {
      getGuessDistribution: (request: AnyChartArgs) => getGuessDistribution(request),
      getTimeToSolveDistribution: (request: AnyChartArgs) => getTimeToSolveDistribution(request),
      getArcadeStreakDistribution: (request: AnyChartArgs) => getArcadeStreakDistribution(request),
      getOpeningGuessesFrequency: (request: AnyChartArgs) => getOpeningGuessesFrequency(request),
      getFailedWordsFrequency: (request: AnyChartArgs) => getFailedWordsFrequency(request),
      getRunDeathReasonFrequency: (request: AnyChartArgs) => getRunDeathReasonFrequency(request),
      getAnyCounter: (request: AnyCounterArgs) => getAnyCounter(request),
      getAnyAvgStat: (request: AnyAvgStatArgs) => getAnyAvgStat(request),
      getHardestWordsLeaderboard: (request: AnyChartArgs) => getHardestWordsLeaderboard(request),
      getBestRunTrophyCard: (request: BestRunTrophyCardArgs) => getBestRunTrophyCard(request),
    } as const;
  }),
}) {
  static readonly layer = Layer.effect(this, this.make);
}
