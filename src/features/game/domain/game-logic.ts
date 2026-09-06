// oxlint-disable effecttsgo/global-date

// services, features, and other libraries
import { Array, DateTime, HashMap, Option, pipe } from "effect";
import { formatGuess, getBasePointsPerTurn, getElapsedSeconds, getSpeedMultiplier, pickStrongerColor } from ".";

// types
import type { Color, TheSecretWord, WordChallenge, WordScore } from ".";

// Calculates the player's word score based on the turn they won on and how long it took them
// This denotes the volatile points earned for the current word before they are banked into the run
export const calculateScore = (currentTurn: WordChallenge["currentTurn"], startTime: WordChallenge["startTime"], endTime: DateTime.Utc) => {
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
export function calculatePotentialScore(currentTurn: WordChallenge["currentTurn"], startTime: WordChallenge["startTime"], now: DateTime.Utc): number;
export function calculatePotentialScore(currentTurn: WordChallenge["currentTurn"], elapsedSeconds: number): number;
export function calculatePotentialScore(
  currentTurn: WordChallenge["currentTurn"],
  startTimeOrSeconds: WordChallenge["startTime"] | number,
  now?: DateTime.Utc
) {
  const elapsedSeconds =
    typeof startTimeOrSeconds === "number"
      ? startTimeOrSeconds
      : getElapsedSeconds(
          startTimeOrSeconds,
          // NOTE: sync pure function — no Effect runtime for `Clock`/`DateTime.now`.
          // Callers in effectful contexts pass `now` explicitly; this is only the fallback.
          Option.getOrElse(Option.fromNullishOr(now), () => DateTime.makeUnsafe(Date.now()))
        );
  return Math.round(getBasePointsPerTurn(currentTurn) * getSpeedMultiplier(elapsedSeconds));
}

// Compute the final keypad state by reducing all guesses and picking the strongest colors
// "undefined" variant matters so downstream code can distinguish "never guessed" — modeled as absent key in HashMap
export const computeKeypadState = (theSecretWord: TheSecretWord, wordleGuesses: WordChallenge["wordleGuesses"]) =>
  pipe(
    wordleGuesses,
    Array.flatMap((guess) => formatGuess(theSecretWord, guess)),
    Array.reduce(HashMap.empty<string, Color>(), (acc: HashMap.HashMap<string, Color>, { tileKey, color }: { tileKey: string; color: Color }) =>
      HashMap.set(acc, tileKey, pickStrongerColor(Option.getOrNull(HashMap.get(acc, tileKey)) ?? undefined, color))
    )
  );
