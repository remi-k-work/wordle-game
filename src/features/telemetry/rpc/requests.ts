// services, features, and other libraries
import { Schema } from "effect";
import { Rpc, RpcGroup } from "effect/unstable/rpc";
import { AddGlobalPulse, AddArcadeRunSummary, AddRunWordEvent } from "@/features/telemetry/domain";
import {
  ArcadeStreakDistributionArgs,
  ArcadeStreakDistributionData,
  FailedWordsFrequencyArgs,
  FailedWordsFrequencyData,
  GamesPlayedCounterArgs,
  GamesPlayedCounterData,
  GuessDistributionArgs,
  GuessDistributionData,
  OpeningGuessesFrequencyArgs,
  OpeningGuessesFrequencyData,
  RunDeathReasonFrequencyArgs,
  RunDeathReasonFrequencyData,
  TimeToSolveDistributionArgs,
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
    payload: GuessDistributionArgs,
    success: GuessDistributionData,
  }),

  Rpc.make("getTimeToSolveDistribution", {
    payload: TimeToSolveDistributionArgs,
    success: TimeToSolveDistributionData,
  }),

  Rpc.make("getArcadeStreakDistribution", {
    payload: ArcadeStreakDistributionArgs,
    success: ArcadeStreakDistributionData,
  }),

  Rpc.make("getOpeningGuessesFrequency", {
    payload: OpeningGuessesFrequencyArgs,
    success: Schema.Array(OpeningGuessesFrequencyData),
  }),

  Rpc.make("getFailedWordsFrequency", {
    payload: FailedWordsFrequencyArgs,
    success: Schema.Array(FailedWordsFrequencyData),
  }),

  Rpc.make("getRunDeathReasonFrequency", {
    payload: RunDeathReasonFrequencyArgs,
    success: Schema.Array(RunDeathReasonFrequencyData),
  }),

  Rpc.make("getGamesPlayedCounter", {
    payload: GamesPlayedCounterArgs,
    success: Schema.Array(GamesPlayedCounterData),
  })
) {}
