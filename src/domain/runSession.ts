// types
import type { RunSession, WordScore } from ".";

// Add a solved word score into the ongoing arcade run
export const bankWordScore = ({ runScore, streak, bestRunScore, bestStreak, ...runSession }: RunSession, { wordScore }: WordScore) => {
  return {
    ...runSession,
    runScore: runScore + wordScore,
    streak: streak + 1,
    bestRunScore: Math.max(bestRunScore, runScore + wordScore),
    bestStreak: Math.max(bestStreak, streak + 1),
  };
};

// Reset only the active run progress while preserving historical session stats
export const resetCurrentRunSession = (runSession: RunSession) => ({ ...runSession, runScore: 0, streak: 0 });

// Close out the active run and record it as the latest completed run
export const finishRunSession = ({ runScore, streak, ...runSession }: RunSession) => ({
  ...runSession,
  runScore: 0,
  streak: 0,
  lastRunScore: runScore,
  lastStreak: streak,
});
