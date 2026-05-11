// services, features, and other libraries
import { Array, Duration, pipe } from "effect";

// types
import type { Color, Language } from ".";

// constants
import { SPEED_MULTIPLIER_CATEGORY_MAP_EN, SPEED_MULTIPLIER_CATEGORY_MAP_PL } from ".";

// Maps a speed multiplier to a category of a player (e.g. "Speed Demon")
export const speedMultiplierToCategory = (language: Language, speedMultiplier: number) =>
  language === "En" ? SPEED_MULTIPLIER_CATEGORY_MAP_EN[speedMultiplier] : SPEED_MULTIPLIER_CATEGORY_MAP_PL[speedMultiplier];

// Formats an Effect Duration into a human-readable HH:mm:ss string
export const formatDuration = (duration: Duration.Duration) => {
  const { hours, minutes, seconds } = Duration.parts(duration);
  const pad = (n: number) => n.toString().padStart(2, "0");

  return hours > 0 ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
};

// Format the current guess word into an array of letter objects with color coding
export const formatGuess = (theSecretWord: string, wordleGuess: string) => {
  // After each guess, the tiles will change color to indicate how close your guess is to the secret word
  const theSecretWordArray = [...theSecretWord];

  // Initialize all tiles as grey (not in word)
  const formattedGuess = pipe(
    [...wordleGuess],
    Array.map((letter) => ({ tileKey: letter, color: "grey" as Color }))
  );

  // Perform a first pass to mark green tiles (correct letter and position)
  formattedGuess.forEach((tile, index) => {
    if (theSecretWordArray[index] === tile.tileKey) {
      formattedGuess[index].color = "green";
      theSecretWordArray[index] = "";
    }
  });

  // Perform a second pass to mark yellow tiles (correct letter, wrong position)
  formattedGuess.forEach((tile, index) => {
    if (tile.color !== "green" && theSecretWordArray.includes(tile.tileKey)) {
      formattedGuess[index].color = "yellow";
      theSecretWordArray[theSecretWordArray.indexOf(tile.tileKey)] = "";
    }
  });

  return formattedGuess;
};
