// services, features, and other libraries
import { Array } from "effect";
import { GameStatusEnum } from "./models";

// types
import type { Color, GameState } from "./models";

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

// Get the current game status (centralized status derivation)
export const getGameStatus = (currentTurn: number, theSecretWord: string, wordleGuesses: readonly string[]) => {
  if (doWeHaveAWinner(theSecretWord, wordleGuesses)) return GameStatusEnum.Won();
  if (currentTurn > 5) return GameStatusEnum.Lost();
  return GameStatusEnum.Playing();
};

// Is the game already over, or is it still going on? When a player runs out of turns or wins the game, the game is ended
export const isGameOver = (currentTurn: number, theSecretWord: string, wordleGuesses: readonly string[]) =>
  getGameStatus(currentTurn, theSecretWord, wordleGuesses)._tag !== "Playing";

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
export const processKey = (key: string, state: GameState) => {
  const { theSecretWord, currentGuessWord, wordleGuesses, currentTurn } = state;

  if (isGameOver(currentTurn, theSecretWord, wordleGuesses)) return state;
  if (!isGuessKeyEntryValid(key)) return state;

  if (key === "Backspace") return { ...state, currentGuessWord: currentGuessWord.slice(0, -1) };
  if (key === "Enter") {
    if (isSubmittedGuessValid(key, currentGuessWord, currentTurn, wordleGuesses))
      return { ...state, wordleGuesses: [...wordleGuesses, currentGuessWord], currentTurn: currentTurn + 1, currentGuessWord: "" };
    return state;
  }
  if (currentGuessWord.length < 5) return { ...state, currentGuessWord: currentGuessWord + key.toUpperCase() };

  return state;
};
