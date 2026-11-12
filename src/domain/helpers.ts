// services, features, and other libraries
import { Cause, Context, Effect, Layer, Option } from "effect";
import { RpcClient, RpcGroup, RpcSerialization } from "effect/rpc";
import { FetchHttpClient } from "effect/http";
import { fromPromise } from "xstate";
import { RuntimeClient } from "@/lib/runtime-client";

// types
import type { Rpc } from "effect/rpc";
import type { ClientRuntimeServices } from "@/lib/runtime-client";

// Runs an AI-backed generation and degrades to `None` on any failure. `tapCause`
// (not `tapError`) logs first so the failure is not silently swallowed: the
// recovery below catches the whole cause, defects included
// The recovery is cause-based rather than `orElseSucceed` (which leaves a defect
// in the error channel and cannot type the RPC handler surface). A pure
// interruption is excluded so a cancelled request still cancels; the handler is
// total for every remaining cause, so the trailing `orDie` (which never touches
// an interrupt) only pins the residual error channel to `never`
export const degradeToNone = <A, E, R>(generate: Effect.Effect<Option.Option<A>, E, R>) =>
  generate.pipe(
    Effect.tapCause(Effect.logError),
    Effect.catchCauseIf(
      (cause) => !Cause.hasInterruptsOnly(cause),
      () => Effect.succeedNone
    ),
    Effect.orDie
  );

// Builds a class-style RPC client service backed by an HTTP protocol layer for a given RPC group.
// Browser-safe: Fetch-based only. Must stay free of server imports (next/server,
// runtime-server, pg-live, platform-node) so client components can use it
export const makeRpcClient = <Rpcs extends Rpc.Any>(serviceName: string, group: RpcGroup.RpcGroup<Rpcs>, path: string) => {
  const ProtocolLive = RpcClient.layerProtocolHttp({ url: path }).pipe(Layer.provide([FetchHttpClient.layer, RpcSerialization.layerSchemaBinary()]));

  return class extends Context.Service<RpcClient.RpcClient<Rpcs>>()(serviceName, {
    make: RpcClient.make(group, { disableTracing: true }),
  }) {
    static readonly layer = Layer.effect(this, this.make).pipe(Layer.provide(ProtocolLive));
  };
};

// Centralized error-escalation policy for SQL/Schema failures
export const dieOnDbFailure = <A, E extends { _tag: string }, R>(effect: Effect.Effect<A, E, R>) =>
  effect.pipe(Effect.tapError(Effect.logError), Effect.catchTags({ SchemaError: Effect.die, SqlError: Effect.die, NoSuchElementError: Effect.die }));

// Builds an XState promise actor from an Effect program. The actor's abort signal
// is forwarded to the managed runtime so cancelled machines stop in-flight work
export const effectActor = <Output, Input, Error>(effect: (input: Input) => Effect.Effect<Output, Error, ClientRuntimeServices>) =>
  fromPromise<Output, Input>(({ input, signal }) => RuntimeClient.runPromise(effect(input), { signal }));
