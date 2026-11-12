// services, features, and other libraries
import { Atom } from "effect/reactivity";
import { RuntimeTelemetryStarter } from "@/lib/runtime-client";
import { PlayerSession } from "@/features/player/domain/models";

// Persistent storage for uniquely identifying the player in the local browser
// NOTE: intentionally `crypto.randomUUID()` — the KVS `defaultValue` is a sync
// thunk with no Effect runtime, and Effect's `Random` has no UUID API (seeded
// PRNG, not cryptographically secure) in any case. The lint disable is scoped
// to exactly this call so unrelated crypto misuse still gets flagged
export const playerSessionAtom = Atom.kvs({
  runtime: RuntimeTelemetryStarter,
  key: "@wordle/playerSession",
  schema: PlayerSession,
  // oxlint-disable-next-line effecttsgo/crypto-random-uuid
  defaultValue: () => ({ sessionId: crypto.randomUUID() }) satisfies PlayerSession,
}).pipe(Atom.keepAlive);

// Specialized selectors for granular state access and optimized re-renders
export const sessionIdAtom = playerSessionAtom.pipe(Atom.map((state) => state.sessionId));
