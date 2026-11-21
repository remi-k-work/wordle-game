// services, features, and other libraries
import type { Effect, Schema } from "effect";
import type { EffectActionArgs, EffectSchema } from "@xstate/effect";

// types
import type { EventObject, MachineContext } from "xstate";

// The single argument a named action receives at runtime: exactly the params it
// was enqueued with (`actionRecord.action.bind(null, params)` in xstate), plus
// `self`, which this codebase passes inside every params object by convention
export type ActionArgs<TParams extends EffectSchema> = Schema.Schema.Type<TParams> & Pick<EffectActionArgs, "self">;

// Action sources derived from their params schemas, so the schemas stay the
// single source of truth; `satisfies` keeps each implementation's Effect
// channels literal, which is what RequirementsFrom reads
export type ActionImplementations<TSchemas extends Record<string, { params: EffectSchema }>> = {
  [K in keyof TSchemas]: (args: ActionArgs<TSchemas[K]["params"]>) => Effect.Effect<void, unknown, unknown>;
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
