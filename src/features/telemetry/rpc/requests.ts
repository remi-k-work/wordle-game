// services, features, and other libraries
import { Schema } from "effect";
import { Rpc, RpcGroup } from "effect/unstable/rpc";
import { AddGlobalPulse, AddArcadeRunSummary, AddRunWordEvent } from "@/features/telemetry/domain";
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
    payload: Schema.Array(AddGlobalPulse),
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

  // B5: scalar shape — COALESCE always materialises exactly one row, so the
  // wire response is a single `{ personal, global }` object (not a 1-element
  // array). Matches `getBestRunTrophyCard`'s non-Array precedent for known
  // cardinality. Backed by SqlSchema.findOne in the charts-db service.
  Rpc.make("getAnyCounter", {
    payload: AnyCounterArgs,
    success: AnyCounterData,
  }),

  Rpc.make("getAnyAvgStat", {
    payload: AnyAvgStatArgs,
    // E3: dedicated Result schema (AnyAvgStatData), structurally identical to
    // AnyCounterData — the wire shape `{ personal, global }` is unchanged.
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
