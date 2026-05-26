// types
import type { HighScore } from ".";

// Determine if the current run qualifies for the high score
export const qualifiesForHighScore = (top10HighScores: ReadonlyArray<HighScore>, lastRunScore: number, lastStreak: number) => {
  // Get the 10th entry (the lowest score in the top 10)
  const tail = top10HighScores.at(-1);

  // If there are fewer than 10 entries, any score qualifies
  if (!tail) return true;

  // Qualification rule (score must be higher than the 10th place score, or if tied, streak must be higher than the 10th place streak)
  return lastRunScore > tail.score || (lastRunScore === tail.score && lastStreak > tail.streak);
};
