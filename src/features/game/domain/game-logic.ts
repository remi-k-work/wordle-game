// services, features, and other libraries
import { Array, DateTime, HashMap, HashSet, pipe } from "effect";
import { getBasePointsPerTurn, getElapsedSeconds, getSpeedMultiplier, pickStrongerColor } from "./helpers";
import { formatGuess } from "./formatters";

// types
import type { Color, TheSecretWord, WordScore } from "./models";
import type { WordChallenge } from "@/features/game/machines/word-challenge/models";

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

// Calculates the "live" potential word score: what the player stands to gain
// from the current turn and the time elapsed since `startTime`, resolved
// against an explicit `now`. One pure core per entry point (no overloads, no
// ambient clock read) so both forms stay directly testable
export const calculatePotentialScore = (currentTurn: WordChallenge["currentTurn"], startTime: WordChallenge["startTime"], now: DateTime.Utc) =>
  Math.round(getBasePointsPerTurn(currentTurn) * getSpeedMultiplier(getElapsedSeconds(startTime, now)));

// The same projection from an already-elapsed duration: the persisted-run and
// read-only simulator path, which has no start time to resolve
export const calculatePotentialScoreFromElapsed = (currentTurn: WordChallenge["currentTurn"], elapsedSeconds: number) =>
  Math.round(getBasePointsPerTurn(currentTurn) * getSpeedMultiplier(elapsedSeconds));

// Compute the final keypad state by reducing all guesses and picking the strongest colors
// Absent keys in the HashMap denote "never guessed" — downstream code can distinguish them
export const computeKeypadState = (theSecretWord: TheSecretWord, wordleGuesses: WordChallenge["wordleGuesses"]) =>
  pipe(
    wordleGuesses,
    Array.flatMap((guess) => formatGuess(theSecretWord, guess)),
    Array.reduce(HashMap.empty<string, Color>(), (acc, { tileKey, color }) => HashMap.set(acc, tileKey, pickStrongerColor(HashMap.get(acc, tileKey), color)))
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
