// services, features, and other libraries
import { Effect, Layer } from "effect";
import { RpcSerialization, RpcServer } from "effect/unstable/rpc";
import { HttpServer, HttpRouter } from "effect/unstable/http";
import { RpcTelemetry } from "./requests";
import { TelemetryDB } from "@/features/telemetry/services/telemetry-db";

const RpcTelemetryLayer = RpcTelemetry.toLayer({
  addGlobalPulse: (payload) =>
    Effect.gen(function* () {
      const telemetryDB = yield* TelemetryDB;
      yield* telemetryDB.addGlobalPulse(payload);
    }),

  addArcadeRunSummary: (payload) =>
    Effect.gen(function* () {
      const telemetryDB = yield* TelemetryDB;
      yield* telemetryDB.addArcadeRunSummary(payload);
    }),

  addRunWordEvent: (payload) =>
    Effect.gen(function* () {
      const telemetryDB = yield* TelemetryDB;
      yield* telemetryDB.addRunWordEvent(payload);
    }),
}).pipe(Layer.provide(TelemetryDB.layer));

const RpcLayer = RpcServer.layerHttp({
  group: RpcTelemetry,
  path: "/api/rpc/telemetry",
  protocol: "http",
  disableFatalDefects: true,
  disableTracing: true,
}).pipe(Layer.provide(Layer.mergeAll(RpcTelemetryLayer, RpcSerialization.layerJson, HttpServer.layerServices)));

export const handler = HttpRouter.toWebHandler(RpcLayer, { disableLogger: true });
