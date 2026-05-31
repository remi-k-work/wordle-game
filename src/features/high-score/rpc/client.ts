// services, features, and other libraries
import { Effect, Layer } from "effect";
import { RpcClient, RpcSerialization } from "@effect/rpc";
import { FetchHttpClient } from "@effect/platform";
import { RpcHighScore } from "./requests";

const ProtocolLive = RpcClient.layerProtocolHttp({ url: "/api/rpc/high-score" }).pipe(Layer.provide([FetchHttpClient.layer, RpcSerialization.layerJson]));

export class RpcHighScoreClient extends Effect.Service<RpcHighScoreClient>()("RpcHighScoreClient", {
  dependencies: [ProtocolLive],
  scoped: RpcClient.make(RpcHighScore),
}) {}
