// services, features, and other libraries
import { Array } from "effect";
import { GameStatusEnum } from "./models";

// types
import type { Color, GameState } from "./models";

// Validate the guess entry as the user types from the keyboard in real time
const isGuessKeyEntryValid = (pressedKey: string) => {
  // Only legitimate and recognized keys are accepted, while everything else is rejected
  if (pressedKey === "Backspace" || pressedKey === "Enter") return true;

  // Apart from the foregoing, only letters will be accepted
  return /^[a-zA-ZąĄćĆęĘłŁńŃóÓśŚźŹżŻ]$/u.test(pressedKey);
};

// Accept or reject the submitted guess after validating it
const isSubmittedGuessValid = (validKey: string, currentGuessWord: string, currentTurn: number, wordleGuesses: readonly string[]) => {
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

// Get the current game status (centralized status derivation)
export const getGameStatus = (currentTurn: number, theSecretWord: string, wordleGuesses: readonly string[]) => {
  // Do we have a winner? When the player correctly guesses the secret word, we have a winner
  if (theSecretWord === wordleGuesses.at(-1)) return GameStatusEnum.Won();

  // Do we have a loser? When the player runs out of turns, we have a loser
  if (currentTurn > 5) return GameStatusEnum.Lost();

  // Otherwise, the game is still in progress
  return GameStatusEnum.Playing();
};

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

// Derive the status of each key on the keypad based on all guesses so far
export const deriveKeypadStatus = (theSecretWord: string, wordleGuesses: readonly string[]) => {
  const status: Record<string, Color> = {};

  for (const guess of wordleGuesses) {
    const formatted = formatGuess(theSecretWord, guess);
    for (const tile of formatted) {
      const currentColor = status[tile.tileKey];
      if (tile.color === "green") {
        status[tile.tileKey] = "green";
      } else if (tile.color === "yellow" && currentColor !== "green") {
        status[tile.tileKey] = "yellow";
      } else if (tile.color === "grey" && !currentColor) {
        status[tile.tileKey] = "grey";
      }
    }
  }

  return status;
};

// Process a key press and return the next game state (encapsulates all state transition logic for key events)
export const processKey = (pressedKey: string, gameState: GameState) => {
  const { theSecretWord, currentGuessWord, wordleGuesses, currentTurn } = gameState;

  //  If game is already over or key is invalid, exit early (no game state change)
  if (getGameStatus(currentTurn, theSecretWord, wordleGuesses)._tag !== "Playing" || !isGuessKeyEntryValid(pressedKey)) return gameState;

  // Handle backspace by removing the last letter from the current guess word
  if (pressedKey === "Backspace") return { ...gameState, currentGuessWord: currentGuessWord.slice(0, -1) };

  // Handle guess submission
  if (pressedKey === "Enter") {
    // If the guess word is invalid, exit early (no game state change)
    if (!isSubmittedGuessValid(pressedKey, currentGuessWord, currentTurn, wordleGuesses)) return gameState;

    // If the guess word is valid, update the game state by adding it to the list of wordle guesses and incrementing the current turn
    return { ...gameState, wordleGuesses: [...wordleGuesses, currentGuessWord], currentTurn: currentTurn + 1, currentGuessWord: "" };
  }

  // Handle letter entry by appending to the current guess word
  if (currentGuessWord.length < 5) return { ...gameState, currentGuessWord: currentGuessWord + pressedKey.toUpperCase() };

  // Otherwise, no game state change
  return gameState;
};
