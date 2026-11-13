// services, features, and other libraries
import { Cause, Context, Effect, Layer, Option } from "effect";
import { RpcClient, RpcGroup, RpcSerialization } from "effect/rpc";
import { FetchHttpClient } from "effect/http";

// types
import type { Rpc } from "effect/rpc";

// Whether a cause is a real failure (a typed error or a defect) rather than a
// pure interruption. A pure interruption is normal lifecycle — a cancelled
// request, a command whose machine stopped mid-flight — so it is neither logged
// as an error nor recovered: it propagates untouched, exactly as the caller's
// cancellation intends
// One predicate guards the log and the recovery below, so the two can never
// drift into logging a cause that is not recovered (or recovering one that was
// never logged)
const isFailure = (cause: Cause.Cause<unknown>) => !Cause.hasInterruptsOnly(cause);

// The shared recovery policy for non-critical Effect work: every real failure
// is logged first, so a failure is never silently swallowed, and any
// non-interruption is recovered through the caller-supplied `recovery`
// A pure interruption is excluded from both, so a cancelled request still
// cancels (and does so without an error-level log), and the trailing `orDie` —
// the recovery is total for every remaining cause — pins the residual error
// channel to `never`
// The recovery is cause-based rather than error-based (`orElseSucceed`), which
// would leave a defect in the error channel and cannot type non-Effect
// boundaries (fire-and-forget commands, RPC handler surfaces)
// Shared by `degradeToNone` below and `runClientCommand` in lib/runtime-client
// so the two recovery sites cannot drift apart. This module imports no app
// code, which is what keeps that edge cycle-free
export const degradeCause = <A, B, E, R>(effect: Effect.Effect<A, E, R>, recovery: Effect.Effect<B, never, never>) =>
  effect.pipe(
    // `tapCauseIf` (not a bare `tapCause`): a plain `tapCause` also fires on
    // interruptions, which would log every cancellation as a failure — noise
    // the recovery below deliberately never acts on
    Effect.tapCauseIf(isFailure, Effect.logError),
    Effect.catchCauseIf(isFailure, () => recovery),
    Effect.orDie
  );

// Runs an AI-backed generation and degrades to `None` on any failure
export const degradeToNone = <A, E, R>(generate: Effect.Effect<Option.Option<A>, E, R>) => degradeCause(generate, Effect.succeedNone);

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

// Centralized error-escalation policy for SQL/Schema failures: nothing behind
// this boundary is recoverable by the caller (a broken query or a malformed row
// has no retry and no fallback), so every typed failure is logged and escalated
// to a defect instead of riding the RPC error channel. `orDie` is the total
// spelling of the three-tag `catchTags` table this replaces — every effect that
// reaches here comes from `SqlSchema` (SqlError | SchemaError |
// NoSuchElementError), so the table could only ever mention all of them
export const dieOnDbFailure = <A, E, R>(effect: Effect.Effect<A, E, R>) => effect.pipe(Effect.tapError(Effect.logError), Effect.orDie);
