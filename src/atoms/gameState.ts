// services, features, and other libraries
import { Atom } from "@effect-atom/atom-react";

// types
import type { GameState } from "@/domain";

// constants
import { INITIAL_GAME_STATE } from "@/domain";

// Primary state container for the active word challenge within the current arcade run
export const gameStateAtom = Atom.make<GameState>(INITIAL_GAME_STATE);

// Specialized selectors for granular state access and optimized re-renders
export const theSecretWordAtom = gameStateAtom.pipe(Atom.map((state) => state.theSecretWord));
export const currentGuessWordAtom = gameStateAtom.pipe(Atom.map((state) => state.currentGuessWord));
export const wordleGuessesAtom = gameStateAtom.pipe(Atom.map((state) => state.wordleGuesses));
export const currentTurnAtom = gameStateAtom.pipe(Atom.map((state) => state.currentTurn));
export const isInvalidGuessAtom = gameStateAtom.pipe(Atom.map((state) => state.isInvalidGuess));
export const startTimeAtom = gameStateAtom.pipe(Atom.map((state) => state.startTime));
export const wordScoreAtom = gameStateAtom.pipe(Atom.map((state) => state.wordScore));
