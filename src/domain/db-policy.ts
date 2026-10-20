// services, features, and other libraries
import { Effect } from "effect";

// Centralized error-escalation policy for SQL/Schema failures (E5): log the failure, then
// escalate SchemaError, SqlError, and NoSuchElementError to defects. This is intentional and
// uniform across every DB-bound service and chart query — failures become fatal rather than
// silently degrading. Keeping the policy here prevents the per-call-site duplicated
// `tapError(...) + catchTags({...})` chain from drifting
//
// NOTE: no `server-only` marker here (unlike domain/helpers.server.ts): this module is
// shared with vitest e2e suites and tsx scripts, which resolve `server-only` to
// its throwing default export. Everything here must stay pure Effect — no
// TanStack server routes, no runtime.server, no pg.server
export const dieOnDbFailure = <A, E extends { _tag: string }, R>(effect: Effect.Effect<A, E, R>) =>
  effect.pipe(Effect.tapError(Effect.logError), Effect.catchTags({ SchemaError: Effect.die, SqlError: Effect.die, NoSuchElementError: Effect.die }));
