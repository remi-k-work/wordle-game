// services, features, and other libraries
import { Atom } from "effect/unstable/reactivity";
import { makeMachineAtom } from "@/lib/machine-atom-factory";
import { wordChallengeMachine } from "@/features/game/machines";

// The word challenge machine is now a living actor inside the effect atom
export const wordChallengeMachineAtom = makeMachineAtom(wordChallengeMachine);

// Specialized selectors for granular state access and optimized re-renders
export const wordChallengeTheSecretWordAtom = wordChallengeMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.theSecretWord));
export const wordChallengeCurrentGuessWordAtom = wordChallengeMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.currentGuessWord));
export const wordChallengeWordleGuessesAtom = wordChallengeMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.wordleGuesses));
export const wordChallengeCurrentTurnAtom = wordChallengeMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.currentTurn));
export const wordChallengeStartTimeAtom = wordChallengeMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.startTime));
export const wordChallengeWordScoreAtom = wordChallengeMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.wordScore));
