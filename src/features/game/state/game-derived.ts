// services, features, and other libraries
import { DateTime } from "effect";
import { Atom } from "effect/unstable/reactivity";
import { calculatePotentialScore, computeKeypadState, deriveWordleGrid } from "@/features/game/domain";
import { wordChallengeCurrentTurnAtom, wordChallengeStartTimeAtom, wordChallengeTheSecretWordAtom, wordChallengeWordleGuessesAtom } from ".";

// Reactive selector for the "live" potential word score based on current progress
export const potentialScoreAtom = Atom.make((get) =>
  calculatePotentialScore(get(wordChallengeCurrentTurnAtom), get(wordChallengeStartTimeAtom), DateTime.makeUnsafe(Date.now()))
);

// View-ready representation of the 6x5 game grid derived from current guesses
export const wordleGridAtom = Atom.make((get) => deriveWordleGrid(get(wordChallengeTheSecretWordAtom), get(wordChallengeWordleGuessesAtom)));

// Current coloring state of the keypad keys based on guess history
export const keypadColorsAtom = Atom.make((get) => computeKeypadState(get(wordChallengeTheSecretWordAtom), get(wordChallengeWordleGuessesAtom)));
