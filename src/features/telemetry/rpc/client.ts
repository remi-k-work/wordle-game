// services, features, and other libraries
import { Context, Layer } from "effect";
import { RpcClient, RpcSerialization } from "effect/unstable/rpc";
import { FetchHttpClient } from "effect/unstable/http";
import { RpcTelemetry } from "./requests";

const ProtocolLive = RpcClient.layerProtocolHttp({ url: "/api/rpc/telemetry" }).pipe(Layer.provide([FetchHttpClient.layer, RpcSerialization.layerJson]));

export class RpcTelemetryClient extends Context.Service<RpcTelemetryClient>()("RpcTelemetryClient", {
  make: RpcClient.make(RpcTelemetry, { disableTracing: true }),
}) {
  static readonly layer = Layer.effect(this, this.make).pipe(Layer.provide(ProtocolLive));
}
