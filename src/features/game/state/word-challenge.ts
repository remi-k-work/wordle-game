// oxlint-disable effecttsgo/global-date

// services, features, and other libraries
import { Array, DateTime, HashMap, Option, pipe } from "effect";
import { Atom } from "effect/unstable/reactivity";
import { wordChallengeMachine } from "@/features/game/machines/word-challenge";
import { calculatePotentialScore, computeKeypadState, formatGuess } from "@/features/game/domain";
import { createMachineAtom } from "@/lib/machine-atom";

// types
import type { Color } from "@/features/game/domain";

// constants
import { MAX_TURNS, WORD_LENGTH } from "@/features/game/domain";

// The word challenge machine is now a living actor inside the effect atom
export const wordChallengeMachineAtom = createMachineAtom(wordChallengeMachine);

// Specialized selectors for granular state access and optimized re-renders
export const wordChallengeTheSecretWordAtom = wordChallengeMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.theSecretWord));
export const wordChallengeCurrentGuessWordAtom = wordChallengeMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.currentGuessWord));
export const wordChallengeWordleGuessesAtom = wordChallengeMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.wordleGuesses));
export const wordChallengeCurrentTurnAtom = wordChallengeMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.currentTurn));
export const wordChallengeStartTimeAtom = wordChallengeMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.startTime));
export const wordChallengeWordScoreAtom = wordChallengeMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.wordScore));

// Reactive selector for the "live" potential word score based on current progress
// NOTE: `Atom.make` getters are synchronous, so `DateTime.now` (an Effect) is
// unavailable here — `Date.now()` is the correct tool.
export const wordChallengePotentialScoreAtom = Atom.make((get) =>
  calculatePotentialScore(get(wordChallengeCurrentTurnAtom), get(wordChallengeStartTimeAtom), DateTime.makeUnsafe(Date.now()))
);

// Derive the full 6x5 grid state for rendering based on completed guesses
export const wordChallengeWordleGridAtom = Atom.make((get) =>
  Option.match(get(wordChallengeTheSecretWordAtom), {
    onNone: () => Array.makeBy(MAX_TURNS, () => Array.makeBy(WORD_LENGTH, () => ({ tileKey: "", color: "" as Color }))),
    onSome: (theSecretWord) =>
      Array.makeBy(MAX_TURNS, (rowIndex) =>
        pipe(
          Array.get(get(wordChallengeWordleGuessesAtom), rowIndex),
          Option.match({
            onNone: () => Array.makeBy(WORD_LENGTH, () => ({ tileKey: "", color: "" as Color })),
            onSome: (guess) => formatGuess(theSecretWord, guess),
          })
        )
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
