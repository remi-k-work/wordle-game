// services, features, and other libraries
import { Option } from "effect";

// types
import type { RunSession } from "./models";

// A factory rather than a shared constant, the value becomes the machine's
// live context, so a module global would be aliased into every running game
export const INITIAL_RUN_SESSION = () =>
  ({
    runId: Option.none(),
    createdAt: Option.none(),
    runScore: 0,
    streak: 0,
    bestRunScore: 0,
    bestStreak: 0,
  }) as const satisfies RunSession;
