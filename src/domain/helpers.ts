// services, features, and other libraries
import { Cause, Context, Effect, Layer, Option } from "effect";
import { RpcClient, RpcGroup, RpcSerialization } from "effect/rpc";
import { FetchHttpClient } from "effect/http";

// types
import type { Rpc } from "effect/rpc";

// Whether a cause is a real failure (a typed error or a defect) rather than a pure interruption
// shared by every log-then-recover site so the predicate lives in one place
export const isRealFailure = <E>(cause: Cause.Cause<E>) => !Cause.hasInterruptsOnly(cause);

// The shared recovery policy for non-critical Effect work: every real failure is logged first and then degraded
export const degradeCause = <A, B, E, R>(effect: Effect.Effect<A, E, R>, recovery: Effect.Effect<B, never, never>) =>
  effect.pipe(
    Effect.tapCauseIf(isRealFailure, (cause) => Effect.logError(Cause.pretty(cause))),
    Effect.catchCauseIf(isRealFailure, () => recovery),
    Effect.orDie
  );

// Runs an AI-backed generation and degrades to `None` on any failure
export const degradeToNone = <A, E, R>(generate: Effect.Effect<Option.Option<A>, E, R>) => degradeCause(generate, Effect.succeedNone);

// Builds a class-style RPC client service backed by an HTTP protocol layer for a given RPC group
export const makeRpcClient = <Rpcs extends Rpc.Any>(serviceName: string, group: RpcGroup.RpcGroup<Rpcs>, path: string) => {
  const ProtocolLive = RpcClient.layerProtocolHttp({ url: path }).pipe(Layer.provide([FetchHttpClient.layer, RpcSerialization.layerSchemaBinary()]));

  return class extends Context.Service<RpcClient.RpcClient<Rpcs>>()(serviceName, {
    make: RpcClient.make(group, { disableTracing: true }),
  }) {
    static readonly layer = Layer.effect(this, this.make).pipe(Layer.provide(ProtocolLive));
  };
};

// Centralized error-escalation policy for SQL/Schema failures: nothing behind this boundary is recoverable by the caller
export const dieOnDbFailure = <A, E, R>(effect: Effect.Effect<A, E, R>) => effect.pipe(Effect.tapError(Effect.logError), Effect.orDie);
