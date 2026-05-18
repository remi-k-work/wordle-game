// services, features, and other libraries
import { Data } from "effect";

// types
import type { GameState, WordScore } from ".";

export type GameEvent = Data.TaggedEnum<{
  WordWon: { readonly wordScore: WordScore; readonly nextGameState: GameState };
  WordLost: { readonly nextGameState: GameState };
}>;

// constants
export const GameEventEnum = Data.taggedEnum<GameEvent>();
