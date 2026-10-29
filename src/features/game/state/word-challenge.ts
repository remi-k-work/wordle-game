// services, features, and other libraries
import { Array, DateTime, HashMap, Option } from "effect";
import { Atom } from "effect/reactivity";
import { wordChallengeMachine } from "@/features/game/machines/word-challenge";
import { calculatePotentialScore, computeKeypadState } from "@/features/game/domain/game-logic";
import { formatGuess } from "@/features/game/domain/formatters";
import { createMachineAtom } from "@/domain/machine-atom";

// types
import type { Color, Tile } from "@/features/game/domain/models";

// constants
import { MAX_TURNS, WORD_LENGTH } from "@/features/game/domain/constants";

// The word challenge machine is now a living actor inside the effect atom
export const wordChallengeMachineAtom = createMachineAtom(wordChallengeMachine);

// Specialized selectors for granular state access and optimized re-renders
export const wordChallengeTheSecretWordAtom = wordChallengeMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.theSecretWord));
export const wordChallengeCurrentGuessWordAtom = wordChallengeMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.currentGuessWord));
export const wordChallengeWordleGuessesAtom = wordChallengeMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.wordleGuesses));
export const wordChallengeCurrentTurnAtom = wordChallengeMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.currentTurn));
export const wordChallengeStartTimeAtom = wordChallengeMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.startTime));
export const wordChallengeWordScoreAtom = wordChallengeMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.wordScore));

// Derived booleans: subscribe to these instead of the full snapshot when only the machine state (not context) is needed
export const wordChallengeIsRejectedAtom = wordChallengeMachineAtom.pipe(Atom.map((snapshot) => snapshot.matches("rejected")));
export const wordChallengeHasWonAtom = wordChallengeMachineAtom.pipe(Atom.map((snapshot) => snapshot.matches("wordWon")));

// Reactive selector for the "live" potential word score based on current progress
export const wordChallengePotentialScoreAtom = Atom.make((get) =>
  calculatePotentialScore(get(wordChallengeCurrentTurnAtom), get(wordChallengeStartTimeAtom), DateTime.nowUnsafe())
);

// An empty row of unplayed tiles, e.g. for the rows below the current guess
const emptyRow = (): Tile[] => Array.makeBy(WORD_LENGTH, (): Tile => ({ tileKey: "", color: "" }));

// Derive the full 6x5 grid state for rendering based on completed guesses
export const wordChallengeWordleGridAtom = Atom.make((get) =>
  Option.match(get(wordChallengeTheSecretWordAtom), {
    onNone: () => Array.makeBy(MAX_TURNS, emptyRow),
    onSome: (theSecretWord) =>
      Array.makeBy(MAX_TURNS, (rowIndex) =>
        Option.match(Array.get(get(wordChallengeWordleGuessesAtom), rowIndex), {
          onNone: emptyRow,
          onSome: (guess) => formatGuess(theSecretWord, guess),
        })
      ),
  })
);

// Current coloring state of the keypad keys based solely on genuine guess history
export const wordChallengeKeypadColorsAtom = Atom.make((get) =>
  Option.match(get(wordChallengeTheSecretWordAtom), {
    onNone: () => HashMap.empty<string, Color>(),
    onSome: (theSecretWord) => computeKeypadState(theSecretWord, get(wordChallengeWordleGuessesAtom)),
  })
);
