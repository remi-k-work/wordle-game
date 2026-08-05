// services, features, and other libraries
import { Context, Layer } from "effect";
import { RpcClient, RpcSerialization } from "effect/unstable/rpc";
import { FetchHttpClient } from "effect/unstable/http";
import { RpcOverdriveHacks } from "./requests";

const ProtocolLive = RpcClient.layerProtocolHttp({ url: "/api/rpc/overdrive-hacks" }).pipe(Layer.provide([FetchHttpClient.layer, RpcSerialization.layerJson]));

export class RpcOverdriveHacksClient extends Context.Service<RpcOverdriveHacksClient>()("RpcOverdriveHacksClient", {
  make: RpcClient.make(RpcOverdriveHacks, { disableTracing: true }),
}) {
  static readonly layer = Layer.effect(this, this.make).pipe(Layer.provide(ProtocolLive));
}
