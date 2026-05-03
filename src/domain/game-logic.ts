// services, features, and other libraries
import { Array } from "effect";

// types
import type { Tile, Color } from "./models";

export const isGuessKeyEntryValid = (pressedKey: string): boolean => {
  if (pressedKey === "Backspace" || pressedKey === "Enter") {
    return true;
  }
  return /^[a-zA-ZąĄćĆęĘłŁńŃóÓśŚźŹżŻ]$/u.test(pressedKey);
};

export const isSubmittedGuessValid = (validKey: string, currentGuessWord: string, currentTurn: number, wordleGuesses: readonly string[]): boolean => {
  if (validKey !== "Enter") return false;
  if (currentTurn > 5) return false;
  if (wordleGuesses.includes(currentGuessWord)) return false;
  if (currentGuessWord.length !== 5) return false;
  return true;
};

export const doWeHaveAWinner = (theSecretWord: string, wordleGuesses: readonly string[]): boolean => {
  const lastGuess = wordleGuesses[wordleGuesses.length - 1];
  return theSecretWord === lastGuess;
};

export const isGameOver = (currentTurn: number, theSecretWord: string, wordleGuesses: readonly string[]): boolean => {
  return currentTurn > 5 || doWeHaveAWinner(theSecretWord, wordleGuesses);
};

export const formatGuess = (theSecretWord: string, wordleGuess: string): readonly Tile[] => {
  const theSecretWordArray = [...theSecretWord];
  const formattedGuess = [...wordleGuess].map((letter) => ({
    tileKey: letter,
    color: "grey" as Color,
  }));

  // Green pass
  formattedGuess.forEach((tile, index) => {
    if (theSecretWordArray[index] === tile.tileKey) {
      tile.color = "green";
      theSecretWordArray[index] = "";
    }
  });

  // Yellow pass
  formattedGuess.forEach((tile) => {
    if (tile.color !== "green" && theSecretWordArray.includes(tile.tileKey)) {
      tile.color = "yellow";
      theSecretWordArray[theSecretWordArray.indexOf(tile.tileKey)] = "";
    }
  });

  return formattedGuess;
};

export const deriveWordleGrid = (theSecretWord: string, wordleGuesses: readonly string[]): readonly (readonly Tile[])[] => {
  const gridRows = 6;
  const gridCols = 5;

  return Array.makeBy(gridRows, (rowIndex) => {
    const guess = wordleGuesses[rowIndex];
    if (guess) {
      return formatGuess(theSecretWord, guess);
    }
    return Array.makeBy(gridCols, () => ({ tileKey: "", color: "" as Color }));
  });
};
