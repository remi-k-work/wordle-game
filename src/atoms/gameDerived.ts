// services, features, and other libraries
import { DateTime } from "effect";
import { Atom } from "@effect-atom/atom-react";
import { calculatePotentialScore, computeKeypadState, deriveWordleGrid, getGameStatus } from "@/domain";
import { currentTurnAtom, startTimeAtom, theSecretWordAtom, wordleGuessesAtom } from ".";

// Reactive selector for the "live" potential word score based on current progress
export const potentialScoreAtom = Atom.make((get) => {
  const currentTurn = get(currentTurnAtom);
  const startTime = get(startTimeAtom);
  const now = DateTime.unsafeNow();
  return calculatePotentialScore(currentTurn, startTime, now);
});

// View-ready representation of the 6x5 game grid derived from current guesses
export const wordleGridAtom = Atom.make((get) => {
  const theSecretWord = get(theSecretWordAtom);
  const wordleGuesses = get(wordleGuessesAtom);
  return deriveWordleGrid(theSecretWord, wordleGuesses);
});

// Current coloring state of the keypad keys based on guess history
export const keypadColorsAtom = Atom.make((get) => {
  const theSecretWord = get(theSecretWordAtom);
  const wordleGuesses = get(wordleGuessesAtom);
  return computeKeypadState(theSecretWord, wordleGuesses);
});

// High-level progress indicator (Playing, Won, or Lost) for the current word
export const gameStatusAtom = Atom.make((get) => {
  const currentTurn = get(currentTurnAtom);
  const theSecretWord = get(theSecretWordAtom);
  const wordleGuesses = get(wordleGuessesAtom);
  return getGameStatus(currentTurn, theSecretWord, wordleGuesses);
});
