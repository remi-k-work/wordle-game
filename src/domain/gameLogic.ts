// services, features, and other libraries
import { Array, HashSet, Duration, DateTime } from "effect";
import { formatGuess, GameStatusEnum, isGuessKeyEntryValid, isSubmittedGuessValid } from ".";

// types
import type { Color, GameState, Score } from ".";

// constants
import { BASE_POINTS_PER_TURN_MAP } from ".";

// Calculates the player's score based on the turn they won on and how long it took them
export const calculateScore = (currentTurn: number, startTime: DateTime.Utc, endTime: DateTime.Utc) => {
  // Establish the base points based on the turn number in which the secret word was solved
  const basePointsPerTurn = BASE_POINTS_PER_TURN_MAP[currentTurn] ?? 0;

  // Establish the speed multiplier based on the time it took
  const seconds = DateTime.distanceDuration(startTime, endTime).pipe(Duration.toSeconds);
  const speedMultiplier = seconds < 30 ? 1.5 : seconds < 60 ? 1.2 : seconds < 180 ? 1.0 : 0.8;

  return {
    totalScore: Math.round(basePointsPerTurn * speedMultiplier),
    basePointsPerTurn,
    speedMultiplier,
    timeSeconds: Math.floor(seconds),
  } as const satisfies Score;
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

// Derive the color of each key on the keypad based on all guesses so far
export const deriveKeypadColors = (theSecretWord: string, wordleGuesses: readonly string[]) => {
  const keypadColors: Record<string, Color> = {};

  for (const guess of wordleGuesses) {
    const formatted = formatGuess(theSecretWord, guess);
    for (const tile of formatted) {
      const currentColor = keypadColors[tile.tileKey];

      // Upgrade the color based on hierarchy: green > yellow > grey
      if (tile.color === "green") {
        keypadColors[tile.tileKey] = "green";
      } else if (tile.color === "yellow" && currentColor !== "green") {
        keypadColors[tile.tileKey] = "yellow";
      } else if (tile.color === "grey" && !currentColor) {
        keypadColors[tile.tileKey] = "grey";
      }
    }
  }

  return keypadColors;
};

// Process a key press and return the next game state (encapsulates all state transition logic for key events)
export const processKey = (pressedKey: string, gameState: GameState, dictionary: HashSet.HashSet<string>, keypadColors: Record<string, Color>) => {
  // If the user pressed a hardware key that is currently "grey" (removed), ignore it! (no game state change)
  const normalizedKey = pressedKey.toUpperCase();
  if (keypadColors[normalizedKey] === "grey") return gameState;

  //  If game is already over or key is invalid, exit early (no game state change)
  const { theSecretWord, currentGuessWord, wordleGuesses, currentTurn } = gameState;
  if (getGameStatus(currentTurn, theSecretWord, wordleGuesses)._tag !== "Playing" || !isGuessKeyEntryValid(pressedKey)) return gameState;

  // Handle backspace by removing the last letter from the current guess word
  if (pressedKey === "Backspace") return { ...gameState, currentGuessWord: currentGuessWord.slice(0, -1), isInvalidGuess: false };

  // Handle guess submission
  if (pressedKey === "Enter") {
    // If it is a full 5-letter guess word but not in the dictionary, make sure to flag it as invalid
    const isValid = isSubmittedGuessValid(pressedKey, currentGuessWord, currentTurn, wordleGuesses, dictionary);
    if (currentGuessWord.length === 5 && !isValid) return { ...gameState, isInvalidGuess: true };

    // If the guess word is invalid, exit early (no game state change)
    if (!isValid) return gameState;

    // If the guess word is valid, update the game state by adding it to the list of wordle guesses and incrementing the current turn
    return { ...gameState, currentGuessWord: "", wordleGuesses: [...wordleGuesses, currentGuessWord], currentTurn: currentTurn + 1, isInvalidGuess: false };
  }

  // Handle letter entry by appending to the current guess word
  if (currentGuessWord.length < 5) return { ...gameState, currentGuessWord: currentGuessWord + pressedKey.toUpperCase(), isInvalidGuess: false };

  // Otherwise, no game state change
  return gameState;
};
