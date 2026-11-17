// services, features, and other libraries
import { Option } from "effect";

// types
import type { RunSession } from "./models";

// A shared constant, safe as a machine spread source (every use spreads it into a fresh object)
export const INITIAL_RUN_SESSION = {
  runId: Option.none(),
  createdAt: Option.none(),
  runScore: 0,
  streak: 0,
  bestRunScore: 0,
  bestStreak: 0,
} as const satisfies RunSession;
