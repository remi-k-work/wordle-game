// services, features, and other libraries
import { Array, DateTime, HashMap, HashSet, Option, pipe } from "effect";
import { getBasePointsPerTurn, getElapsedSeconds, getSpeedMultiplier, pickStrongerColor } from "./helpers";
import { formatGuess } from "./formatters";

// types
import type { Color, TheSecretWord, WordChallenge, WordScore } from "./models";

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
  const elapsedSeconds = typeof startTimeOrSeconds === "number" ? startTimeOrSeconds : getElapsedSeconds(startTimeOrSeconds, now ?? DateTime.nowUnsafe());
  return Math.round(getBasePointsPerTurn(currentTurn) * getSpeedMultiplier(elapsedSeconds));
}

// Compute the final keypad state by reducing all guesses and picking the strongest colors
// "undefined" variant matters so downstream code can distinguish "never guessed" — modeled as absent key in HashMap
export const computeKeypadState = (theSecretWord: TheSecretWord, wordleGuesses: WordChallenge["wordleGuesses"]) =>
  pipe(
    wordleGuesses,
    Array.flatMap((guess) => formatGuess(theSecretWord, guess)),
    Array.reduce(HashMap.empty<string, Color>(), (acc: HashMap.HashMap<string, Color>, { tileKey, color }: { tileKey: string; color: Color }) =>
      HashMap.set(acc, tileKey, pickStrongerColor(Option.getOrUndefined(HashMap.get(acc, tileKey)), color))
    )
  );

// Letters whose strongest color across all guesses is "grey" — the keypad keys
// that are dead for the rest of the puzzle. The machine computes this once per
// submission (see `submitGuess`) so the per-keypress guard stays a pure O(1)
// set lookup instead of re-scanning the whole board on every keystroke
export const computeGreyLetters = (theSecretWord: TheSecretWord, wordleGuesses: WordChallenge["wordleGuesses"]) =>
  pipe(
    computeKeypadState(theSecretWord, wordleGuesses),
    HashMap.filter((color: Color) => color === "grey"),
    HashMap.keys,
    HashSet.fromIterable
  );
