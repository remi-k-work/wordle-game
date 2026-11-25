// types
import type { RunSession } from "./models";

// constants
import { INITIAL_RUN_SESSION } from "./constants";

export const finishActiveRunContext = (context: RunSession) =>
  ({ ...INITIAL_RUN_SESSION(), bestRunScore: context.bestRunScore, bestStreak: context.bestStreak }) as const satisfies RunSession;
