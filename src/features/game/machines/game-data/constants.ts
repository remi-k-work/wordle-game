// services, features, and other libraries
import { Option } from "effect";

// types
import type { GameData } from "./models";

// constants
export const GAME_DATA_TIMEOUT_MS = 30_000;

// A factory rather than a shared constant, the value becomes the machine's
// live context, so a module global would be aliased into every running game
export const INITIAL_GAME_DATA = () =>
  ({
    solutions: Option.none(),
    dictionary: Option.none(),
    keypad: Option.none(),
  }) as const satisfies GameData;
