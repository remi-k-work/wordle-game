// services, features, and other libraries
import { Schema } from "effect";
import { Rpc, RpcGroup } from "effect/unstable/rpc";
import { AddGlobalPulse, AddArcadeRunSummary, AddRunWordEvent } from "@/features/telemetry/domain";

export class RpcTelemetry extends RpcGroup.make(
  Rpc.make("addGlobalPulse", {
    payload: Schema.Array(AddGlobalPulse),
  }),

  Rpc.make("addArcadeRunSummary", {
    payload: AddArcadeRunSummary,
  }),

  Rpc.make("addRunWordEvent", {
    payload: AddRunWordEvent,
  })
) {}
