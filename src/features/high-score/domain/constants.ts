// services, features, and other libraries
import { Option } from "effect";

// types
import type { HighScoreMachineContext } from ".";

// constants
export const INITIAL_HIGH_SCORE_CONTEXT = {
  playerName: "",
  runScore: 0,
  streak: 0,
  solutionsLanguage: "En",
  newHighScoreId: Option.none(),
} as const satisfies HighScoreMachineContext;
