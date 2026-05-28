// services, features, and other libraries
import { Data, DateTime } from "effect";

// types
import type { GameState } from ".";

export type GameEvent = Data.TaggedEnum<{ WordWon: { readonly nextGameState: GameState; readonly endTime: DateTime.Utc }; WordLost: object }>;

// constants
export const GameEventEnum = Data.taggedEnum<GameEvent>();
