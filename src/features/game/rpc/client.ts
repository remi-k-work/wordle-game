// services, features, and other libraries
import { Effect, Layer } from "effect";
import { RpcClient, RpcSerialization } from "@effect/rpc";
import { FetchHttpClient } from "@effect/platform";
import { RpcGame } from "./requests";

const ProtocolLive = RpcClient.layerProtocolHttp({ url: "/api/rpc/game" }).pipe(Layer.provide([FetchHttpClient.layer, RpcSerialization.layerNdjson]));

export class RpcGameClient extends Effect.Service<RpcGameClient>()("RpcGameClient", {
  dependencies: [ProtocolLive],
  scoped: RpcClient.make(RpcGame),
}) {}
