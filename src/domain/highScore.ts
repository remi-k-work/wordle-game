// types
import type { HighScore } from ".";

// Determine if the current run qualifies for the high score
export const qualifiesForHighScore = (top10HighScores: ReadonlyArray<HighScore>, lastRunScore: number, lastStreak: number) => {
  // If the high score is not full yet (less than 10 entries), any score qualifies
  if (top10HighScores.length < 10) return true;

  // The 10th entry is the one to beat
  const tail = top10HighScores[top10HighScores.length - 1];

  // Qualification: score must be higher or if tied, streak must be higher
  return lastRunScore > tail.score || (lastRunScore === tail.score && lastStreak > tail.streak);
};
