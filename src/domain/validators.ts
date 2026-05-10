// services, features, and other libraries
import { HashSet } from "effect";

// Validate the guess entry as the user types from the keyboard in real time
export const isGuessKeyEntryValid = (pressedKey: string) => {
  // Only legitimate and recognized keys are accepted, while everything else is rejected
  if (pressedKey === "Backspace" || pressedKey === "Enter") return true;

  // Apart from the foregoing, only letters will be accepted
  return /^[a-zA-ZąĄćĆęĘłŁńŃóÓśŚźŹżŻ]$/u.test(pressedKey);
};

// Accept or reject the submitted guess after validating it
export const isSubmittedGuessValid = (
  validKey: string,
  currentGuessWord: string,
  currentTurn: number,
  wordleGuesses: readonly string[],
  dictionary: HashSet.HashSet<string>
) => {
  // Make sure the user is attempting to submit a new guess word
  if (validKey !== "Enter") return false;

  // Is this the final turn? We do not wish to continue the guess word submission
  if (currentTurn > 5) return false;

  // Do not allow duplicate words
  if (wordleGuesses.includes(currentGuessWord)) return false;

  // Make sure the term is at least 5 characters long
  if (currentGuessWord.length !== 5) return false;

  // The fast lookup whether the guessed word is in the dictionary
  if (!HashSet.has(dictionary, currentGuessWord)) return false;

  // Allow and proceed because the given guess word is correct
  return true;
};
