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

export class ChartsDB extends Context.Service<ChartsDB>()("ChartsDB", {
  // Error-escalation policy (E5): every chart query escalates both SchemaError
  // and SqlError to defects (Effect.die) — the query factories and the
  // histogram methods below do this via the shared dieOnDbFailure policy.
  // There is no per-chart graceful degradation; all failures become RPC 500s.
  // This is intentional and uniform across every method here — telemetry
  // charts are best-effort. Do NOT introduce per-chart catch branches that
  // disagree with this policy
  make: Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient;

    const getGuessDistribution = Effect.fn("getGuessDistribution")(function* (request: AnyChartArgs) {
      const rows = yield* guessDistributionQuery(sql)(request);

      const chartData = cumulativeToDistribution(rows, (row, personal, global, personalPct, globalPct) => ({
        turn: row.turn,
        personal,
        global,
        personalPct,
        globalPct,
      })).filter((row) => row.turn !== null);

      // Decode against the strict schema, as recommended for final domain mapping
      return yield* Schema.decodeEffect(Schema.Array(GuessDistributionData))(chartData).pipe(dieOnDbFailure);
    });

    const getTimeToSolveDistribution = Effect.fn("getTimeToSolveDistribution")(function* (request: AnyChartArgs) {
      const rows = yield* timeToSolveDistributionQuery(sql)(request);

      const chartData = cumulativeToDistribution(rows, (row, personal, global, personalPct, globalPct) => ({
        maxSeconds: row.maxSeconds,
        personal,
        global,
        personalPct,
        globalPct,
      }));

      // Decode against the strict schema, as recommended for final domain mapping
      return yield* Schema.decodeEffect(Schema.Array(TimeToSolveDistributionData))(chartData).pipe(dieOnDbFailure);
    });

    const getArcadeStreakDistribution = Effect.fn("getArcadeStreakDistribution")(function* (request: AnyChartArgs) {
      const rows = yield* arcadeStreakDistributionQuery(sql)(request);

      const chartData = cumulativeToDistribution(rows, (row, personal, global, personalPct, globalPct) => ({
        streak: row.streak,
        personal,
        global,
        personalPct,
        globalPct,
      }));

      // Decode against the strict schema, as recommended for final domain mapping
      return yield* Schema.decodeEffect(Schema.Array(ArcadeStreakDistributionData))(chartData).pipe(dieOnDbFailure);
    });

    // Simple passthroughs to query functions — no additional logic or tracing value at this layer,
    // so untraced variants avoid creating redundant spans
    const getOpeningGuessesFrequency = Effect.fnUntraced(function* (request: AnyChartArgs) {
      return yield* openingGuessesFrequencyQuery(sql)(request);
    });

    const getFailedWordsFrequency = Effect.fnUntraced(function* (request: AnyChartArgs) {
      return yield* failedWordsFrequencyQuery(sql)(request);
    });

    const getRunDeathReasonFrequency = Effect.fnUntraced(function* (request: AnyChartArgs) {
      return yield* runDeathReasonFrequencyQuery(sql)(request);
    });

    const getAnyCounter = Effect.fnUntraced(function* (request: AnyCounterArgs) {
      return yield* anyCounterQuery(sql)(request);
    });

    const getAnyAvgStat = Effect.fnUntraced(function* (request: AnyAvgStatArgs) {
      return yield* anyAvgStatQuery(sql)(request);
    });

    const getHardestWordsLeaderboard = Effect.fnUntraced(function* (request: AnyChartArgs) {
      return yield* hardestWordsLeaderboardQuery(sql)(request);
    });

    const getBestRunTrophyCard = Effect.fnUntraced(function* (request: BestRunTrophyCardArgs) {
      return yield* bestRunTrophyCardQuery(sql)(request);
    });

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
