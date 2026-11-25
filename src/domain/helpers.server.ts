// services, features, and other libraries
import { Config, Context, Effect, Layer, Option } from "effect";
import { RpcGroup, RpcSerialization, RpcServer } from "effect/rpc";
import { HttpRouter, HttpServer } from "effect/http";
import { RpcLogger } from "@/services/rpc-logger";
import { degradeToNone } from "./helpers";

// types
import type { Rpc } from "effect/rpc";

// constants
import { IS_WORKERD, SYNC_SCHEDULER_LAYER } from "@/domain/constants";

// Belt-and-braces for workerd: the default async scheduler dispatches fibers
// through setImmediate timers owned by the request that first scheduled them,
// so any fiber outliving that request dies with "Cannot call this
// AsyncLocalStorage bound function outside of the request in which it was
// created". The sync scheduler dispatches via microtasks, which are not
// request-owned. (See Scheduler.MixedScheduler and the Workers recipe on
// HttpRouter.toWebHandler; the per-request runtime below is the primary fix.)
// SYNC_SCHEDULER_LAYER is defined once in @/domain/constants and shared with
// lib/runtime.server.ts so both stay in sync

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
    Layer.provideMerge(SYNC_SCHEDULER_LAYER)
  );

  if (IS_WORKERD) {
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

// Adapts an HttpRouter web handler to TanStack Start's server route-handler shape, which receives the request wrapped in a context object
export const routeHandler =
  (webHandler: { readonly handler: (request: Request) => Response | Promise<Response> }) =>
  ({ request }: { request: Request }) =>
    webHandler.handler(request);

// Reads the AI switch from Config, defaulting to "on"; only the layer that
// builds the AI enrichment reads it; callers read the reference below instead
const readAiSwitch = Config.Literals(["off", "on"], "AI_SWITCH").pipe(Config.withDefault("on"));

// The AI feature flag as a context reference: "on" unless overridden, so AI-backed code can be tested without providing Config
export const AiSwitch = Context.Reference<"off" | "on">("AiSwitch", { defaultValue: () => "on" });

// The config-backed value for the reference, read once when the layer is built rather than on every AI call
export const AiSwitchLayer = Layer.effect(AiSwitch, readAiSwitch);

// Runs the AI-backed generation unless the AI switch is off, in which case the
// cheap fallback is served instead (avoids rate limits and token usage)
// Combinator-based (no Effect.gen wrapper) per Effect conventions for reusable functions
export const withAiEnabled = <A, E, R>(generate: Effect.Effect<A, E, R>, fallback: Effect.Effect<A, E, R>) =>
  Effect.flatMap(AiSwitch, (aiSwitch) => (aiSwitch === "off" ? fallback : generate));

// Runs the AI-backed generation unless the AI switch is off, in which case the
// cheap fallback is served instead. The combined result degrades to `None` on
// any failure, because AI-backed enrichment is never critical to a response
export const withAiFallback = <A, E, R>(generate: Effect.Effect<Option.Option<A>, E, R>, fallback: Effect.Effect<Option.Option<A>, E, R>) =>
  degradeToNone(withAiEnabled(generate, fallback));
