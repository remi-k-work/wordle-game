// services, features, and other libraries
import { Config, Effect, Layer } from "effect";
import { RpcGroup, RpcSerialization, RpcServer } from "effect/rpc";
import { HttpRouter, HttpServer } from "effect/http";
import { RpcLogger } from "@/services/rpc-logger";

// types
import type { Rpc } from "effect/rpc";

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
  }).pipe(Layer.provide(Layer.mergeAll(handlersLayer, RpcSerialization.layerSchemaBinary(), HttpServer.layerServices, RpcLogger.layer)));

  return HttpRouter.toWebHandler(RpcLayer, { disableLogger: true });
};

// Adapts an HttpRouter web handler to TanStack Start's server route-handler shape,
// which receives the request wrapped in a context object
export const routeHandler =
  (webHandler: { readonly handler: (request: Request) => Response | Promise<Response> }) =>
  ({ request }: { request: Request }) =>
    webHandler.handler(request);

// Reads the AI switch from Config, defaulting to "on". AI-backed RPCs call this to skip expensive
// generation (avoiding rate limits and token usage) when the switch is off
export const readAiSwitch = Config.Literal("off", "AI_SWITCH").pipe(Config.orElse(() => Config.succeed("on" as const)));

// Runs the AI-backed generation unless the AI switch is off, in which case the
// cheap fallback is served instead (avoids rate limits and token usage)
export const withAiEnabled = <A, E, R>(generate: Effect.Effect<A, E, R>, fallback: Effect.Effect<A, E, R>) =>
  Effect.flatMap(readAiSwitch, (aiSwitch) => (aiSwitch === "off" ? fallback : generate));
