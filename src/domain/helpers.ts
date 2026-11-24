// services, features, and other libraries
import { Cause, Context, Effect, Layer, Option } from "effect";
import { RpcClient, RpcGroup, RpcSerialization, RpcTest } from "effect/rpc";
import { FetchHttpClient } from "effect/http";

// types
import type { Rpc } from "effect/rpc";

// A test-only fake for an RPC client: each method takes the decoded payload and
// returns an Effect of the decoded success. It is deliberately looser than the
// real client signature (which is generic over the queue/discard options) so a
// test can write plain functions; `layerFake` casts it into the client shape.
type RpcClientFake<Rpcs extends Rpc.Any> = {
  readonly [K in Rpcs as K["_tag"]]?: (payload: Rpc.Payload<K>) => Effect.Effect<Rpc.Success<K>>;
};

// Whether a cause is a real failure (a typed error or a defect) rather than a pure interruption
// shared by every log-then-recover site so the predicate lives in one place
export const isRealFailure = <E>(cause: Cause.Cause<E>) => !Cause.hasInterruptsOnly(cause);

// The shared recovery policy for non-critical Effect work: every real failure is
// logged and degraded in one step (the recovery effect cannot fail, so sequencing
// log-then-recover with `andThen` is safe); pure interrupts fall through to `orDie`
export const degradeCause = <A, B, E, R>(effect: Effect.Effect<A, E, R>, recovery: Effect.Effect<B, never, never>) =>
  effect.pipe(
    Effect.catchCauseIf(isRealFailure, (cause) => Effect.andThen(Effect.logError(Cause.pretty(cause)), recovery)),
    Effect.orDie
  );

// Runs an AI-backed generation and degrades to `None` on any failure
export const degradeToNone = <A, E, R>(generate: Effect.Effect<Option.Option<A>, E, R>) => degradeCause(generate, Effect.succeedNone);

// `Layer.mock` cannot name the loosened `RpcClientFake` shape directly (the real
// client methods are generic), so bridge the two here where `S` is inferred from
// the service key as a real type parameter.
const mockRpcClient = <I, S extends object>(key: Context.Key<I, S>, fake: object): Layer.Layer<I> => Layer.mock(key, fake as Layer.PartialEffectful<S>);

// Builds a class-style RPC client service backed by an HTTP protocol layer for a given RPC group
export const makeRpcClient = <Rpcs extends Rpc.Any>(serviceName: string, group: RpcGroup.RpcGroup<Rpcs>, path: string) => {
  const ProtocolLive = RpcClient.layerProtocolHttp({ url: path }).pipe(Layer.provide([FetchHttpClient.layer, RpcSerialization.layerSchemaBinary()]));

  return class extends Context.Service<RpcClient.RpcClient<Rpcs>>()(serviceName, {
    make: RpcClient.make(group, { disableTracing: true }),
  }) {
    static readonly layer = Layer.effect(this, this.make).pipe(Layer.provide(ProtocolLive));

    // Test-only: a protocol-faithful in-memory client for this group. Provide
    // the group's handlers (for example `RpcGame.toLayer({ ... })`) in the
    // environment to answer its calls; nothing touches HTTP or the network.
    static readonly layerTest = Layer.effect(this, RpcTest.makeClient(group));

    // Test-only: substitute the client with a content fake. Any method left out
    // fails loudly (an UnimplementedError defect) if it is ever called.
    static readonly layerFake = (fake: RpcClientFake<Rpcs>) => mockRpcClient(this, fake);
  };
};

// Centralized error-escalation policy for SQL/Schema failures: log the full
// cause (so defects keep their stack trace, not just typed errors), then
// escalate to a defect — nothing behind this boundary is recoverable
export const dieOnDbFailure = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
  effect.pipe(
    Effect.tapCause((cause) => Effect.logError(Cause.pretty(cause))),
    Effect.orDie
  );
