// services, features, and other libraries
import { Config, Context, Effect, Layer } from "effect";
import { RpcClient, RpcGroup, RpcSerialization, RpcServer } from "effect/unstable/rpc";
import { FetchHttpClient, HttpRouter, HttpServer } from "effect/unstable/http";
import { RpcLoggerLive } from "@/services/rpc-logger";

// types
import type { Rpc } from "effect/unstable/rpc";

// Builds a class-style RPC client service backed by an HTTP protocol layer for a given RPC group
export const makeRpcClient = <Rpcs extends Rpc.Any>(serviceName: string, group: RpcGroup.RpcGroup<Rpcs>, path: string) => {
  const ProtocolLive = RpcClient.layerProtocolHttp({ url: path }).pipe(Layer.provide([FetchHttpClient.layer, RpcSerialization.layerSchemaBinary()]));

  return class extends Context.Service<RpcClient.RpcClient<Rpcs>>()(serviceName, {
    make: RpcClient.make(group, { disableTracing: true }),
  }) {
    static readonly layer = Layer.effect(this, this.make).pipe(Layer.provide(ProtocolLive));
  };
};

// Builds the web handler for an RPC group's HTTP route. disableFatalDefects serializes defects
// as an Exit instead of closing the connection; disableTracing is deliberate (no tracer configured)
// The handlers layer claims Rpc.ServicesServer too: the schema services those requirements resolve
// to for a concrete group are already covered, and the claim is checked at each call site
export const makeRpcHandler = <Rpcs extends Rpc.Any, LE>(
  group: RpcGroup.RpcGroup<Rpcs>,
  path: HttpRouter.PathInput,
  handlersLayer: Layer.Layer<Rpc.ToHandler<Rpcs> | Rpc.ServicesServer<Rpcs>, LE, never>
) => {
  const RpcLayer = RpcServer.layerHttp({
    group,
    path,
    protocol: "http",
    disableFatalDefects: true,
    disableTracing: true,
  }).pipe(Layer.provide(Layer.mergeAll(handlersLayer, RpcSerialization.layerSchemaBinary(), HttpServer.layerServices, RpcLoggerLive)));

  return HttpRouter.toWebHandler(RpcLayer, { disableLogger: true });
};

// Reads the AI switch from Config, defaulting to "on". AI-backed RPCs call this to skip expensive
// generation (avoiding rate limits and token usage) when the switch is off
export const readAiSwitch = Config.Literal("off", "AI_SWITCH").pipe(Config.orElse(() => Config.succeed("on" as const)));

// Centralized error-escalation policy for SQL/Schema failures (E5): log the failure, then
// escalate SchemaError, SqlError, and NoSuchElementError to defects. This is intentional and
// uniform across every DB-bound service and chart query — failures become fatal rather than
// silently degrading. Keeping the policy here prevents the per-call-site duplicated
// `tapError(...) + catchTags({...})` chain from drifting
export const dieOnDbFailure = <A, E extends { _tag: string }, R>(effect: Effect.Effect<A, E, R>) =>
  effect.pipe(Effect.tapError(Effect.logError), Effect.catchTags({ SchemaError: Effect.die, SqlError: Effect.die, NoSuchElementError: Effect.die }));
