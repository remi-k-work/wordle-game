// services, features, and other libraries
import { Array, DateTime, Duration, Option, pipe } from "effect";

// types
import type { Color, WordChallenge, WordScore } from ".";

// constants
import { BASE_POINTS_PER_TURN_MAP, COLOR_PRIORITY, POTENTIAL_SCORE_RANGE, SPEED_MULTIPLIER_RULES } from ".";

// Pick the color with the higher priority
export const pickStrongerColor = (a: Color | undefined, b: Color) => {
  if (!a) return b;
  return COLOR_PRIORITY[b] > COLOR_PRIORITY[a] ? b : a;
};

// Establish the speed multiplier based on the time it took
export const getSpeedMultiplier = (elapsedSeconds: number) =>
  pipe(
    SPEED_MULTIPLIER_RULES,
    Array.findFirst(({ maxSeconds }) => elapsedSeconds < maxSeconds),
    Option.map(({ multiplier }) => multiplier),
    Option.getOrElse(() => 0.8)
  );

// Resolve the base score value per the turn in which the word is solved
export const getBasePointsPerTurn = (currentTurn: WordChallenge["currentTurn"]) => BASE_POINTS_PER_TURN_MAP[currentTurn] ?? 0;

// Calculate elapsed time in seconds, treating an unstarted timer as zero seconds
export const getElapsedSeconds = (startTime: WordChallenge["startTime"], endTime: DateTime.Utc) =>
  Option.match(startTime, {
    onNone: () => 0,
    onSome: (startTime) => DateTime.distance(startTime, endTime).pipe(Duration.toSeconds),
  });

// Represent the "live" potential word score as a percentage (normalize only against the maximum possible score)
export const potentialScoreAsPercentage = (potentialScore: WordScore["wordScore"]) =>
  Math.max(0, Math.min(100, Math.sqrt(potentialScore / POTENTIAL_SCORE_RANGE.max) * 100));
