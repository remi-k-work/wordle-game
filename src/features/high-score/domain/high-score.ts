// types
import type { HighScore } from ".";

// Determine if the current run qualifies for the high score
export const qualifiesForHighScore = (top10HighScores: ReadonlyArray<HighScore>, lastRunScore: HighScore["score"], lastStreak: HighScore["streak"]) => {
  // If there are fewer than 10 entries, any score qualifies
  if (top10HighScores.length < 10) return true;

  // Get the 10th entry (the lowest score in the top 10)
  const tail = top10HighScores.at(-1)!;

  // Qualification rule (score must be higher than the 10th place score, or if tied, streak must be higher than the 10th place streak)
  return lastRunScore > tail.score || (lastRunScore === tail.score && lastStreak > tail.streak);
};
