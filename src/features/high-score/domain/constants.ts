// types
import type { HighScoreMachineContext } from ".";

// constants
export const INITIAL_HIGH_SCORE_CONTEXT = { playerName: "AAA", runScore: 0, streak: 0, solutionsLanguage: "En" } as const satisfies HighScoreMachineContext;
