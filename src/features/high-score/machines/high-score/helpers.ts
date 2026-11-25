// types
import type { HighScore } from "./models";

// The `runFinished` payload, shared by the four transitions that reset the context with a fresh run
interface RunFinished {
  readonly runScore: HighScore["runScore"];
  readonly streak: HighScore["streak"];
  readonly solutionsLanguage: HighScore["solutionsLanguage"];
}

// constants
import { INITIAL_HIGH_SCORE } from "./constants";

export const runFinishedContext = (event: RunFinished) =>
  ({ ...INITIAL_HIGH_SCORE(), runScore: event.runScore, streak: event.streak, solutionsLanguage: event.solutionsLanguage }) as const satisfies HighScore;
