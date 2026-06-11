// services, features, and other libraries
import { Data, DateTime } from "effect";

// types
import type { GameState, RunSession } from ".";

export type GameEvent = Data.TaggedEnum<{
  WordWon: { readonly nextGameState: GameState; readonly endTime: DateTime.Utc };
  WordLost: { readonly nextRunSession: RunSession };
}>;

// constants
export const GameEventEnum = Data.taggedEnum<GameEvent>();
