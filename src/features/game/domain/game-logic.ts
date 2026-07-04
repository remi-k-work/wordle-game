// services, features, and other libraries
import { Array, DateTime, pipe, Option } from "effect";
import { formatGuess, getBasePointsPerTurn, getElapsedSeconds, getSpeedMultiplier, pickStrongerColor } from ".";

// types
import type { Color, WordScore } from ".";

// Calculates the player's word score based on the turn they won on and how long it took them
// This denotes the volatile points earned for the current word before they are banked into the run
export const calculateScore = (currentTurn: number, startTime: Option.Option<DateTime.Utc>, endTime: DateTime.Utc) => {
  const basePointsPerTurn = getBasePointsPerTurn(currentTurn);
  const elapsedSeconds = getElapsedSeconds(startTime, endTime);
  const speedMultiplier = getSpeedMultiplier(elapsedSeconds);

  return {
    wordScore: Math.round(basePointsPerTurn * speedMultiplier),
    basePointsPerTurn,
    speedMultiplier,
    timeSeconds: Math.floor(elapsedSeconds),
  } as const satisfies WordScore;
};

// Calculates the "live" potential word score based on current turn and time elapsed
// This projects what the player stands to gain based on their current speed and turn count
export function calculatePotentialScore(currentTurn: number, startTime: Option.Option<DateTime.Utc>, now: DateTime.Utc): number;
export function calculatePotentialScore(currentTurn: number, elapsedSeconds: number): number;
export function calculatePotentialScore(currentTurn: number, startTimeOrSeconds: Option.Option<DateTime.Utc> | number, now?: DateTime.Utc) {
  const elapsedSeconds = typeof startTimeOrSeconds === "number" ? startTimeOrSeconds : getElapsedSeconds(startTimeOrSeconds, now!);
  return Math.round(getBasePointsPerTurn(currentTurn) * getSpeedMultiplier(elapsedSeconds));
}

// Compute the final keypad state by reducing all guesses and picking the strongest colors
export const computeKeypadState = (theSecretWord: string, wordleGuesses: readonly string[]) =>
  pipe(
    wordleGuesses,
    Array.flatMap((guess) => formatGuess(theSecretWord, guess)),
    Array.reduce({} as Record<string, Color>, (acc, { tileKey, color }) => {
      acc[tileKey] = pickStrongerColor(acc[tileKey], color);
      return acc;
    })
  );
