// services, features, and other libraries
import { Array } from "effect";

// types
import type { Color } from "./models";

// Validate the guess entry as the user types from the keyboard in real time
export const isGuessKeyEntryValid = (pressedKey: string) => {
  // Only legitimate and recognized keys are accepted, while everything else is rejected
  if (pressedKey === "Backspace" || pressedKey === "Enter") return true;

  // Apart from the foregoing, only letters will be accepted
  return /^[a-zA-ZąĄćĆęĘłŁńŃóÓśŚźŹżŻ]$/u.test(pressedKey);
};

// Accept or reject the submitted guess after validating it
export const isSubmittedGuessValid = (validKey: string, currentGuessWord: string, currentTurn: number, wordleGuesses: readonly string[]) => {
  // Make sure the user is attempting to submit a new guess word
  if (validKey !== "Enter") return false;

  // Is this the final turn? We do not wish to continue the guess word submission
  if (currentTurn > 5) return false;

  // Do not allow duplicate words
  if (wordleGuesses.includes(currentGuessWord)) return false;

  // Make sure the term is at least 5 characters long
  if (currentGuessWord.length !== 5) return false;

  // Allow and proceed because the given guess word is correct
  return true;
};

// Do we have a winner? When the player correctly guesses the secret word, we have a winner
export const doWeHaveAWinner = (theSecretWord: string, wordleGuesses: readonly string[]) => theSecretWord === wordleGuesses.at(-1);

// Is the game already over, or is it still going on? When a player runs out of turns or wins the game, the game is ended
export const isGameOver = (currentTurn: number, theSecretWord: string, wordleGuesses: readonly string[]) =>
  currentTurn > 5 || doWeHaveAWinner(theSecretWord, wordleGuesses);

// Format the current guess word into an array of letter objects (e.g. [{ tileKey: "A", color: "yellow" }])
export const formatGuess = (theSecretWord: string, wordleGuess: string) => {
  // After each guess, the tiles will change color to indicate how close your guess is to the secret word
  const theSecretWordArray = [...theSecretWord];

  // By default, all tiles are gray; letters are not in the secret word
  const formattedGuess = [...wordleGuess].map((letter) => ({ tileKey: letter, color: "grey" as Color }));

  // Look for green tiles: letters in the correct place
  formattedGuess.forEach((tile, index) => {
    if (theSecretWordArray[index] === tile.tileKey) {
      formattedGuess[index].color = "green";
      theSecretWordArray[index] = "";
    }
  });

  // Look for yellow tiles: letters in the word, but in the wrong place
  formattedGuess.forEach((tile, index) => {
    if (tile.color !== "green" && theSecretWordArray.includes(tile.tileKey)) {
      formattedGuess[index].color = "yellow";
      theSecretWordArray[theSecretWordArray.indexOf(tile.tileKey)] = "";
    }
  });

  return formattedGuess;
};

// To avoid storing a complex state object that is difficult to mutate, we store a simple one
export const deriveWordleGrid = (theSecretWord: string, wordleGuesses: readonly string[]) => {
  const gridRows = 6;
  const gridCols = 5;

  return Array.makeBy(gridRows, (rowIndex) => {
    const guess = wordleGuesses[rowIndex];
    if (guess) return formatGuess(theSecretWord, guess);
    return Array.makeBy(gridCols, () => ({ tileKey: "", color: "" as Color }));
  });
};
