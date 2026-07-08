// services, features, and other libraries
import { Struct } from "effect";
import { Atom } from "effect/unstable/reactivity";
import { RuntimeTelemetryStarter } from "@/lib/runtime-client";
import { PlayerSession } from "@/features/player/domain";

// Persistent storage for uniquely identifying the player in the local browser
export const playerSessionAtom = Atom.kvs({
  runtime: RuntimeTelemetryStarter,
  key: "@wordle/playerSession",
  schema: PlayerSession.mapFields(Struct.pick(["sessionId"])),
  defaultValue: () => ({ sessionId: crypto.randomUUID() }) as const satisfies PlayerSession,
});

// Specialized selectors for granular state access and optimized re-renders
export const sessionIdAtom = playerSessionAtom.pipe(Atom.map((state) => state.sessionId));
