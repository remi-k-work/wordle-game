// services, features, and other libraries
import { Schema } from "effect";
import { Rpc, RpcGroup } from "effect/rpc";
import { AddGlobalPulse, AddArcadeRunSummary, AddRunWordEvent } from "@/features/telemetry/domain/models";
import {
  AnyAvgStatArgs,
  AnyAvgStatData,
  AnyChartArgs,
  AnyCounterArgs,
  AnyCounterData,
  ArcadeStreakDistributionData,
  BestRunTrophyCardArgs,
  BestRunTrophyCardData,
  FailedWordsFrequencyData,
  GuessDistributionData,
  HardestWordsLeaderboardData,
  OpeningGuessesFrequencyData,
  RunDeathReasonFrequencyData,
  TimeToSolveDistributionData,
} from "@/features/telemetry/services/charts-db/models";

export class RpcTelemetry extends RpcGroup.make(
  Rpc.make("addGlobalPulse", {
    // `sql.insert` compiles one or more rows; an empty batch is never valid
    payload: Schema.NonEmptyArray(AddGlobalPulse),
  }),

  Rpc.make("addArcadeRunSummary", {
    payload: AddArcadeRunSummary,
  }),

  Rpc.make("addRunWordEvent", {
    payload: AddRunWordEvent,
  }),

  Rpc.make("getGuessDistribution", {
    payload: AnyChartArgs,
    success: Schema.Array(GuessDistributionData),
  }),

  Rpc.make("getTimeToSolveDistribution", {
    payload: AnyChartArgs,
    success: Schema.Array(TimeToSolveDistributionData),
  }),

  Rpc.make("getArcadeStreakDistribution", {
    payload: AnyChartArgs,
    success: Schema.Array(ArcadeStreakDistributionData),
  }),

  Rpc.make("getOpeningGuessesFrequency", {
    payload: AnyChartArgs,
    success: Schema.Array(OpeningGuessesFrequencyData),
  }),

  Rpc.make("getFailedWordsFrequency", {
    payload: AnyChartArgs,
    success: Schema.Array(FailedWordsFrequencyData),
  }),

  Rpc.make("getRunDeathReasonFrequency", {
    payload: AnyChartArgs,
    success: Schema.Array(RunDeathReasonFrequencyData),
  }),

  Rpc.make("getAnyCounter", {
    payload: AnyCounterArgs,
    success: AnyCounterData,
  }),

  Rpc.make("getAnyAvgStat", {
    payload: AnyAvgStatArgs,
    success: AnyAvgStatData,
  }),

  Rpc.make("getHardestWordsLeaderboard", {
    payload: AnyChartArgs,
    success: Schema.Array(HardestWordsLeaderboardData),
  }),

  Rpc.make("getBestRunTrophyCard", {
    payload: BestRunTrophyCardArgs,
    success: Schema.Option(BestRunTrophyCardData),
  })
) {}
