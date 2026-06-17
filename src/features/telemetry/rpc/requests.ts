// services, features, and other libraries
import { Schema } from "effect";
import { Rpc, RpcGroup } from "effect/unstable/rpc";
import { AddGlobalPulse, AddArcadeRunSummary, AddRunWordEvent, GuessDistributionArgs, GuessDistributionData } from "@/features/telemetry/domain";

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
  })
) {}
