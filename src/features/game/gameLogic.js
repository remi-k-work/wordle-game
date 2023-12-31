// Validate the guess entry as the user types from the keyboard in real time
export function isGuessKeyEntryValid(pressedKey) {
  // Only legitimate and recognized keys are accepted, while everything else is rejected
  if (pressedKey === "Backspace" || pressedKey === "Enter") {
    return true;
  }

  // Apart from the foregoing, only letters will be accepted
  if (/^[a-zA-ZąĄćĆęĘłŁńŃóÓśŚźŹżŻ]$/u.test(pressedKey)) {
    return true;
  }

  // The guess entry key is invalid
  return false;
}

// Accept or reject the submitted guess after validating it
export function isSubmittedGuessValid(validKey, currentGuessWord, currentTurn, wordleGuesses) {
  // Make sure the user is attempting to submit a new guess word
  if (validKey !== "Enter") {
    return false;
  }

  // Is this the final turn?
  if (currentTurn > 5) {
    // We do not wish to continue the guess word submission
    return false;
  }

  // Do not allow duplicate words
  if (wordleGuesses.includes(currentGuessWord)) {
    return false;
  }

  // Make sure the term is at least 5 characters long
  if (currentGuessWord.length !== 5) {
    return false;
  }

  // Allow and proceed because the given guess word is correct
  return true;
}

// Do we have a winner?
export function doWeHaveaWinner(theSecretWord, wordleGuesses) {
  // When the player correctly guesses the secret word, we have a winner
  return theSecretWord === wordleGuesses.at(-1);
}

// Is the game already over, or is it still going on?
export function isGameOver(currentTurn, theSecretWord, wordleGuesses) {
  // When a player runs out of turns or wins the game, the game is ended
  return currentTurn > 5 || doWeHaveaWinner(theSecretWord, wordleGuesses);
}

// To avoid storing a complex state object that is difficult to mutate, we store a simple one
// (an array of moves, for example) and derive more useful representations of state as needed
export function deriveWordleGrid(theSecretWord, wordleGuesses) {
  const gridRows = 6;
  const gridCols = 5;

  const wordleGrid = [];
  for (let i = 0; i < gridRows; i++) {
    // Create an empty sub-array for each row
    wordleGrid[i] = [];
    for (let j = 0; j < gridCols; j++) {
      // Each grid's cell represents a guess tile
      // e.g. [{ tileKey: "A", color: "yellow" }]
      wordleGrid[i][j] = { tileKey: "", color: "" };
    }
  }

  let guessRow = 0;
  for (const wordleGuess of wordleGuesses) {
    const formattedGuess = formatGuess(theSecretWord, wordleGuess);
    let tileNum = 0;
    for (const guessTile of formattedGuess) {
      wordleGrid[guessRow][tileNum].tileKey = guessTile.tileKey;
      wordleGrid[guessRow][tileNum].color = guessTile.color;
      tileNum++;
    }
    guessRow++;
  }

  return wordleGrid;
}

// Format the current guess word into an array of letter objects
// e.g. [{ tileKey: "A", color: "yellow" }]
export function formatGuess(theSecretWord, wordleGuess) {
  // After each guess, the tiles will change color to indicate how close your guess is to the secret word
  const theSecretWordArray = [...theSecretWord];
  const formattedGuess = [...wordleGuess].map((letter) => {
    // By default, all tiles are gray; letters are not in the secret word
    return { tileKey: letter, color: "grey" };
  });

  // Look for green tiles: letters in the correct place
  formattedGuess.forEach((letter, index) => {
    if (theSecretWordArray[index] === letter.tileKey) {
      formattedGuess[index].color = "green";
      theSecretWordArray[index] = null;
    }
  });

  // Look for yellow tiles: letters in the word, but in the wrong place
  formattedGuess.forEach((letter, index) => {
    if (theSecretWordArray.includes(letter.tileKey) && letter.color !== "green") {
      formattedGuess[index].color = "yellow";
      theSecretWordArray[theSecretWordArray.indexOf(letter.tileKey)] = null;
    }
  });

  return formattedGuess;
}
