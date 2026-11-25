// types
import type { Effect, Schema } from "effect";
import type { AtomRegistry } from "effect/reactivity";
import type { EffectActionArgs, EffectSchema } from "@xstate/effect";
import type { TelemetryTracker } from "@/features/telemetry/services/telemetry-tracker";
import type { EventObject, MachineContext } from "xstate";

// The single argument a named action receives at runtime: exactly the params it
// was enqueued with (`actionRecord.action.bind(null, params)` in xstate), plus
// `self`, which this codebase passes inside every params object by convention
export type ActionArgs<TParams extends EffectSchema> = Schema.Schema.Type<TParams> & Pick<EffectActionArgs, "self">;

// Action sources derived from their params schemas, so the schemas stay the
// single source of truth. The signatures are pinned here rather than inferred
// from each body: action bodies write to send atoms whose types come from the
// machines that register these actions, so inference would chase the whole
// graph and form a cycle. The record requires the runtime's atom registry and
// telemetry tracker (pure actions satisfy both requirements), and the
// `unknown` error leaves room for actions such as run-session's Option lift
export type ActionImplementations<TSchemas extends Record<string, { params: EffectSchema }>> = {
  [K in keyof TSchemas]: (args: ActionArgs<TSchemas[K]["params"]>) => Effect.Effect<void, unknown, AtomRegistry.AtomRegistry | TelemetryTracker>;
};

// The subset of the transition args a guard receives; guards in this codebase
// only read the context and the event (plus `self` for symmetry)
export type GuardArgs<TContext extends MachineContext, TEvent extends EventObject> = Pick<EffectActionArgs<TContext, TEvent>, "context" | "event" | "self">;

// XState derives each event as `{ type: K } & payload` from the schema map key;
// Effect schemas are not StandardSchemaV1, so `InferEvents` cannot be applied
// to them directly
export type EventUnion<TSchemas extends Record<string, EffectSchema>> = {
  [K in keyof TSchemas]: Schema.Schema.Type<TSchemas[K]> & { readonly type: K };
}[keyof TSchemas];
