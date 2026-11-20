// services, features, and other libraries
import { SecureRandom } from "effect/crypto";
import { Atom } from "effect/reactivity";
import { RuntimeTelemetryStarter } from "@/lib/runtime-client";
import { PlayerSession } from "@/features/player/domain/models";

// Persistent storage for uniquely identifying the player in the local browser
export const playerSessionAtom = Atom.kvs({
  runtime: RuntimeTelemetryStarter,
  key: "@wordle/playerSession",
  schema: PlayerSession,
  defaultValue: () => ({ sessionId: SecureRandom.uuidV4Unsafe() }) satisfies PlayerSession,
}).pipe(Atom.keepAlive);

// Specialized selectors for granular state access and optimized re-renders
export const sessionIdAtom = playerSessionAtom.pipe(Atom.map((state) => state.sessionId));
