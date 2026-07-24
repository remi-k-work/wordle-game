// services, features, and other libraries
import { Schema } from "effect";
import { Rpc, RpcGroup } from "effect/unstable/rpc";
import { AddGlobalPulse, AddArcadeRunSummary, AddRunWordEvent } from "@/features/telemetry/domain";
import {
  AnyAvgStatArgs,
  AnyChartArgs,
  AnyCounterArgs,
  AnyCounterData,
  ArcadeStreakDistributionData,
  FailedWordsFrequencyData,
  GuessDistributionData,
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

  Rpc.make("getAnyCounter", {
    payload: AnyCounterArgs,
    success: Schema.Array(AnyCounterData),
  }),

  Rpc.make("getAnyAvgStat", {
    payload: AnyAvgStatArgs,
    success: Schema.Array(AnyCounterData),
  })
) {}
