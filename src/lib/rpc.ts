// services, features, and other libraries
import { Config, Context, Layer } from "effect";
import { RpcClient, RpcGroup, RpcSerialization } from "effect/unstable/rpc";
import { FetchHttpClient } from "effect/unstable/http";

// types
import type { Rpc } from "effect/unstable/rpc";

// Builds a class-style RPC client service backed by an HTTP protocol layer for a given RPC group.
export const makeRpcClient = <Rpcs extends Rpc.Any>(serviceName: string, group: RpcGroup.RpcGroup<Rpcs>, path: string) => {
  const ProtocolLive = RpcClient.layerProtocolHttp({ url: path }).pipe(Layer.provide([FetchHttpClient.layer, RpcSerialization.layerJson]));

  return class extends Context.Service<RpcClient.RpcClient<Rpcs>>()(serviceName, {
    make: RpcClient.make(group, { disableTracing: true }),
  }) {
    static readonly layer = Layer.effect(this, this.make).pipe(Layer.provide(ProtocolLive));
  };
};

// Reads the AI switch from Config, defaulting to "on". AI-backed RPCs call this to skip expensive
// generation (avoiding rate limits and token usage) when the switch is off.
export const readAiSwitch = Config.literal("off", "AI_SWITCH").pipe(Config.orElse(() => Config.succeed("on" as const)));
