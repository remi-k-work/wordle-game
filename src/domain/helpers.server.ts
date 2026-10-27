// services, features, and other libraries
import { Config, Effect, Layer, Option, Scheduler } from "effect";
import { RpcGroup, RpcSerialization, RpcServer } from "effect/rpc";
import { HttpRouter, HttpServer } from "effect/http";
import { RpcLogger } from "@/services/rpc-logger";
import { isWorkerd } from "@/lib/is-workerd";

// types
import type { Rpc } from "effect/rpc";

// Belt-and-braces for workerd: the default async scheduler dispatches fibers
// through setImmediate timers owned by the request that first scheduled them,
// so any fiber outliving that request dies with "Cannot call this
// AsyncLocalStorage bound function outside of the request in which it was
// created". The sync scheduler dispatches via microtasks, which are not
// request-owned. (See Scheduler.MixedScheduler and the Workers recipe on
// HttpRouter.toWebHandler; the per-request runtime below is the primary fix.)
const SyncScheduler = Layer.succeed(Scheduler.Scheduler, new Scheduler.MixedScheduler("sync"));

// Builds the web handler for an RPC group's HTTP route. disableFatalDefects serializes defects
// as an Exit instead of closing the connection; disableTracing is deliberate (no tracer configured)
// The handlers layer claims Rpc.ServicesServer too: the schema services those requirements resolve
// to for a concrete group are already covered, and the claim is checked at each call site
//
// On workerd the handler builds the router into a fresh runtime per request and
// disposes it after the response: request-created sockets are destroyed when the
// request ends (a shared pool's connections go stale and reusing them hangs), and
// shared schedulers/timers are AsyncLocalStorage-bound to their creating request.
// A per-request runtime gives the PG connection, the pool and every fiber they
// spawn exactly the request's lifetime — the same one-client-per-request shape
// Cloudflare documents for Hyperdrive. Node has neither constraint, so it keeps a
// single module-scoped handler
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
  }).pipe(
    Layer.provide(Layer.mergeAll(handlersLayer, RpcSerialization.layerSchemaBinary(), HttpServer.layerServices, RpcLogger.layer)),
    Layer.provideMerge(SyncScheduler)
  );

  if (isWorkerd) {
    // The handler's `context` parameter stays a required, unresolved generic inside
    // this function (it resolves to optional at the concrete route call sites, which
    // type-check), and the runtime handler treats a missing context as empty — the
    // single-argument call is sound
    return {
      handler: (request: Request) => {
        const app = HttpRouter.toWebHandler(RpcLayer, { disableLogger: true });
        const dispatch = app.handler as (request: Request, context?: unknown) => Promise<Response>;
        return dispatch(request).finally(app.dispose);
      },
    };
  }

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
export const readAiSwitch = Config.Literals(["off", "on"], "AI_SWITCH").pipe(Config.withDefault("on"));

// Runs the AI-backed generation unless the AI switch is off, in which case the
// cheap fallback is served instead (avoids rate limits and token usage)
export const withAiEnabled = <A, E, R>(generate: Effect.Effect<A, E, R>, fallback: Effect.Effect<A, E, R>) =>
  Effect.flatMap(readAiSwitch, (aiSwitch) => (aiSwitch === "off" ? fallback : generate));

// Runs an AI-backed generation and degrades to `None` on any failure. The
// failure is logged first so it is not silently swallowed
export const withAiFallback = <A, E, R>(generate: Effect.Effect<Option.Option<A>, E, R>, fallback: Effect.Effect<Option.Option<A>, E, R>) =>
  withAiEnabled(generate, fallback).pipe(
    Effect.tapError(Effect.logError),
    Effect.orElseSucceed(() => Option.none())
  );
