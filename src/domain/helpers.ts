// services, features, and other libraries
import { Array, DateTime, Duration, Option, pipe } from "effect";
import { getGameStatus } from ".";

// types
import type { Color, GameState, RunSession, WordScore } from ".";

// constants
import { BASE_POINTS_PER_TURN_MAP, SPEED_MULTIPLIER_RULES } from ".";

const COLOR_PRIORITY = { grey: 0, yellow: 1, green: 2, red: 3, "": -1 } as const as Record<Color, number>;

// Pick the color with the higher priority
export const pickStrongerColor = (a: Color | undefined, b: Color) => {
  if (!a) return b;
  return COLOR_PRIORITY[b] > COLOR_PRIORITY[a] ? b : a;
};

// Establish the speed multiplier based on the time it took
export const getSpeedMultiplier = (seconds: number) =>
  pipe(
    SPEED_MULTIPLIER_RULES,
    Array.findFirst(({ maxSeconds }) => seconds < maxSeconds),
    Option.map(({ multiplier }) => multiplier),
    Option.getOrElse(() => 0.8)
  );

// Resolve the base score value for the turn in which the word is solved
export const getBasePointsForTurn = (currentTurn: number) => BASE_POINTS_PER_TURN_MAP[currentTurn] ?? 0;

// Calculate elapsed time in seconds, treating an unstarted timer as zero seconds
export const elapsedSeconds = (startTime: Option.Option<DateTime.Utc>, endTime: DateTime.Utc) =>
  Option.match(startTime, {
    onNone: () => 0,
    onSome: (startTime) => DateTime.distanceDuration(startTime, endTime).pipe(Duration.toSeconds),
  });

// Get the status for a full game state without threading individual state fields around
export const getGameStateStatus = ({ currentTurn, theSecretWord, wordleGuesses }: GameState) => getGameStatus(currentTurn, theSecretWord, wordleGuesses);

// Check if the current game state is still actively accepting player input
export const isGamePlaying = (gameState: GameState) => getGameStateStatus(gameState)._tag === "Playing";

// Add a solved word score into the ongoing arcade run
export const bankWordScore = ({ runScore, streak, bestRunScore, ...runSession }: RunSession, { wordScore }: WordScore) => {
  return { ...runSession, runScore: runScore + wordScore, streak: streak + 1, bestRunScore: Math.max(bestRunScore, runScore + wordScore) };
};

// Reset only the active run progress while preserving historical session stats
export const resetCurrentRunSession = (runSession: RunSession) => ({ ...runSession, runScore: 0, streak: 0 });

// Close out the active run and record it as the latest completed run
export const finishRunSession = ({ runScore, streak, ...runSession }: RunSession) => ({
  ...runSession,
  runScore: 0,
  streak: 0,
  lastRunScore: runScore,
  lastRunStreak: streak,
});
