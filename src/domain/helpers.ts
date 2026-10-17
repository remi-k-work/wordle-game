// oxlint-disable effecttsgo/async-function

import "server-only";

// next
import { connection } from "next/server";
import { notFound, unauthorized } from "next/navigation";

// services, features, and other libraries
import { Config, Effect, Layer, Match, pipe, Result, Schema } from "effect";
import { RpcGroup, RpcSerialization, RpcServer } from "effect/rpc";
import { HttpRouter, HttpServer } from "effect/http";
import { RpcLogger } from "@/services/rpc-logger";
import { InvalidPageInputsError } from "./errors";

// types
import type { BasePage } from "./models";
import type { Rpc } from "effect/rpc";
import type { ServerMainServices } from "@/lib/runtime-server";

interface PageInputPromises {
  params: Promise<Record<string, string>>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// The encoded shape every page schema must accept: Next.js route inputs as
// modeled by the domain (`BasePage`). Threading it through the generic keeps
// the schema's `Type`, `Encoded`, and `DecodingServices` precise instead of
// widening to `Schema.Top` (whose `DecodingServices` is `unknown`)
type PageInputsEncoded = (typeof BasePage)["Encoded"];

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

// Reads the AI switch from Config, defaulting to "on". AI-backed RPCs call this to skip expensive
// generation (avoiding rate limits and token usage) when the switch is off
export const readAiSwitch = Config.Literal("off", "AI_SWITCH").pipe(Config.orElse(() => Config.succeed("on" as const)));

// Safely validate next.js route inputs (`params` and `searchParams`) against a schema; return typed data or trigger a 404 on failure
export const validatePageInputs = <A, S extends Schema.Constraint & { readonly Type: A; readonly Encoded: PageInputsEncoded }>(
  schema: S,
  { params, searchParams }: PageInputPromises
) =>
  Effect.gen(function* () {
    const [p, sp] = yield* Effect.all([Effect.promise(() => params), Effect.promise(() => searchParams)], { concurrency: 2 });
    return yield* Schema.decodeEffect(schema)({ params: p, searchParams: sp }).pipe(
      Effect.mapError((cause) => new InvalidPageInputsError({ message: "Invalid page inputs", cause }))
    );
  });

// Execute the main effect for the page, map known errors to the subsequent navigation helpers, and return the payload
// NOTE: intentionally `async` — this bridges Effect into the async Server Component
// contract (`await connection()`, `RuntimeServer.runPromise`, and the throwing
// `notFound()`/`unauthorized()` navigation helpers). Representing it as an
// `Effect.gen` would only move the `await` into the caller
export const runPageMainOrNavigate = async <A, E extends { _tag: string }>(pageMain: Effect.Effect<A, E, ServerMainServices>) => {
  // Explicitly defer to request time (Effect uses Date.now() internally). The
  // dynamic runtime-server import breaks the static cycle helpers ->
  // runtime-server (keeping it lazy lets server modules, e.g. *-db, stay
  // importable from both graphs) and runs in parallel with `connection()` —
  // it only needs to resolve by the time `runPromise` is called, so don't
  // serialize the two (async-parallel)
  const [, { RuntimeServer }] = await Promise.all([connection(), import("@/lib/runtime-server")]);

  // We wrap in Effect.result to catch failures gracefully
  const pageMainResult = await RuntimeServer.runPromise(
    pageMain.pipe(
      Effect.tapError((error) => Effect.log("[PAGE MAIN ERROR]:", error)),
      Effect.result
    )
  );

  // Standardized error handling: dispatch known error tags to the matching
  // navigation helpers, and re-throw anything unexpected for the error boundary.
  // The onFailure branch never returns — known errors `notFound()`/`unauthorized()`,
  // unknown errors re-throw for the error boundary
  return Result.match(pageMainResult, {
    onFailure: (error): never =>
      pipe(
        Match.value(error._tag),
        Match.whenOr("InvalidPageInputsError", "ItemNotFoundError", () => notFound()),
        Match.whenOr("UnauthorizedAccessError", "BetterAuthApiError", () => unauthorized()),
        Match.orElse(() => {
          throw error;
        })
      ),
    onSuccess: (result) => result,
  });
};
