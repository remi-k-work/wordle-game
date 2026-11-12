// services, features, and other libraries
import { Effect } from "effect";

// Centralized error-escalation policy for SQL/Schema failures
export const dieOnDbFailure = <A, E extends { _tag: string }, R>(effect: Effect.Effect<A, E, R>) =>
  effect.pipe(Effect.tapError(Effect.logError), Effect.catchTags({ SchemaError: Effect.die, SqlError: Effect.die, NoSuchElementError: Effect.die }));
