// services, features, and other libraries
import { Option, String } from "effect";

// types
import type { HighScore } from "./models";

// constants
// A factory rather than a shared constant, the value becomes the machine's
// live context, so a module global would be aliased into every running machine
export const INITIAL_HIGH_SCORE = () =>
  ({
    playerName: String.empty,
    runScore: 0,
    streak: 0,
    solutionsLanguage: "En",
    newHighScoreId: Option.none(),
  }) as const satisfies HighScore;
