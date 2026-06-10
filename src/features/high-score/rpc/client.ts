// services, features, and other libraries
import { Context, Layer } from "effect";
import { RpcClient, RpcSerialization } from "effect/unstable/rpc";
import { FetchHttpClient } from "effect/unstable/http";
import { RpcHighScore } from "./requests";

const ProtocolLive = RpcClient.layerProtocolHttp({ url: "/api/rpc/high-score" }).pipe(Layer.provide([FetchHttpClient.layer, RpcSerialization.layerJson]));

export class RpcHighScoreClient extends Context.Service<RpcHighScoreClient>()("RpcHighScoreClient", {
  make: RpcClient.make(RpcHighScore, { disableTracing: true }),
}) {
  static readonly layer = Layer.effect(this, this.make).pipe(Layer.provide(ProtocolLive));
}
