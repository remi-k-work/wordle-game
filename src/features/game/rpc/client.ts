// services, features, and other libraries
import { Context, Layer } from "effect";
import { RpcClient, RpcSerialization } from "effect/unstable/rpc";
import { FetchHttpClient } from "effect/unstable/http";
import { RpcGame } from "./requests";

const ProtocolLive = RpcClient.layerProtocolHttp({ url: "/api/rpc/game" }).pipe(Layer.provide([FetchHttpClient.layer, RpcSerialization.layerJson]));

export class RpcGameClient extends Context.Service<RpcGameClient>()("RpcGameClient", {
  make: RpcClient.make(RpcGame),
}) {
  static readonly layer = Layer.effect(this, this.make).pipe(Layer.provide(ProtocolLive));
}
