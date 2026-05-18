// services, features, and other libraries
import { PubSub, Effect } from "effect";

// types
import type { GameEvent } from "@/domain";

// Create an unbounded PubSub with unlimited capacity for game events
export const gameEventsPubSub = Effect.runSync(PubSub.unbounded<GameEvent>());
