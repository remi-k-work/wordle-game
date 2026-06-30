// services, features, and other libraries
import { Array, DateTime, Match, pipe, Option } from "effect";
import {
  formatGuess,
  GameActionEnum,
  GameStatusEnum,
  getBasePointsPerTurn,
  getElapsedSeconds,
  getSpeedMultiplier,
  isGuessKeyValid,
  pickStrongerColor,
} from ".";

// types
import type { Color, WordScore } from ".";

// constants
import { MAX_TURNS } from ".";

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

// Get the current game status by checking the last guess and current turn
export const getGameStatus = (currentTurn: number, theSecretWord: string, wordleGuesses: readonly string[]) => {
  // Do we have a winner? When the player correctly guesses the secret word, we have a winner
  if (theSecretWord === wordleGuesses.at(-1)) return GameStatusEnum.Won();

  // Do we have a loser? When the player runs out of turns, we have a loser
  if (currentTurn > MAX_TURNS) return GameStatusEnum.Lost();

  // Otherwise, the game is still in progress
  return GameStatusEnum.Playing();
};

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

// Translate raw keyboard input into pure domain actions based on current keypad state
export const parseKey = (pressedKey: string, keypadColors: Record<string, Color>) => {
  // Invalid key -> Ignore
  if (!isGuessKeyValid(pressedKey)) return GameActionEnum.Ignore();

  return Match.value(pressedKey.toUpperCase()).pipe(
    // Greyed key -> Ignore
    Match.when(
      (normalizedKey) => keypadColors[normalizedKey] === "grey",
      () => GameActionEnum.Ignore()
    ),

    // BACKSPACE -> RemoveLetter
    Match.when("BACKSPACE", () => GameActionEnum.RemoveLetter()),

    // ENTER -> SubmitGuess
    Match.when("ENTER", () => GameActionEnum.SubmitGuess()),

    // Letter -> AddLetter
    Match.orElse((normalizedKey) => GameActionEnum.AddLetter({ letter: normalizedKey }))
  );
};
