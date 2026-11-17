// services, features, and other libraries
import { Array, DateTime, HashMap, Option } from "effect";
import { Atom } from "effect/reactivity";
import { createActorAtoms } from "@xstate/effect/atom";
import { wordChallengeMachine } from "@/features/game/machines/word-challenge";
import { RuntimeAtom } from "@/lib/runtime-client";
import { calculatePotentialScore, computeKeypadState } from "@/features/game/domain/game-logic";
import { formatGuess } from "@/features/game/domain/formatters";
import { createMachineState } from "@/lib/machine-atoms";

// types
import type { Color, Tile } from "@/features/game/domain/models";

// constants
import { EMPTY_TILE_KEY, MAX_TURNS, WORD_LENGTH } from "@/features/game/domain/constants";

const wordChallengeMachineBag = createActorAtoms(RuntimeAtom, wordChallengeMachine);
export const { snapshot: wordChallengeMachineAtom, send: wordChallengeMachineSendAtom } = createMachineState(wordChallengeMachine, wordChallengeMachineBag);

// Specialized selectors for granular state access and optimized re-renders
export const wordChallengeTheSecretWordAtom = wordChallengeMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.theSecretWord));
export const wordChallengeCurrentGuessWordAtom = wordChallengeMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.currentGuessWord));
export const wordChallengeWordleGuessesAtom = wordChallengeMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.wordleGuesses));
export const wordChallengeCurrentTurnAtom = wordChallengeMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.currentTurn));
export const wordChallengeStartTimeAtom = wordChallengeMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.startTime));
export const wordChallengeWordScoreAtom = wordChallengeMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.wordScore));
export const wordChallengeIsRejectedAtom = wordChallengeMachineAtom.pipe(Atom.map((snapshot) => snapshot.matches("rejected")));
export const wordChallengeHasWonAtom = wordChallengeMachineAtom.pipe(Atom.map((snapshot) => snapshot.matches("wordWon")));

// A once-a-second clock signal, in the same shape as Effect's own
// `Atom.windowFocusSignal`: the read registers a listener, publishes a new tick
// with `setSelf`, and tears the listener down through `addFinalizer` when the
// atom loses its last subscriber (so no timer survives an unmounted board)
// No `window` (SSR) means a single value and no listener
const secondTickAtom = Atom.readable<number>((get) => {
  if (typeof window === "undefined") return 0;

  let ticks = 0;
  const interval = setInterval(() => get.setSelf(++ticks), 1000);
  get.addFinalizer(() => clearInterval(interval));

  return ticks;
});

// Reactive selector for the "live" potential word score based on current progress
export const wordChallengePotentialScoreAtom = Atom.make((get) => {
  // Subscribed, not `get.once`: every tick invalidates this read, which is what
  // makes the projected score track the clock. The turn and the start time only
  // move when the player acts, so without this dependency the "live" score would
  // freeze between keystrokes instead of bleeding away with every second
  get(secondTickAtom);

  return calculatePotentialScore(get(wordChallengeCurrentTurnAtom), get(wordChallengeStartTimeAtom), DateTime.nowUnsafe());
});

// An empty row of unplayed tiles, e.g. for the rows below the current guess
const emptyRow = (): Tile[] => Array.makeBy(WORD_LENGTH, (): Tile => ({ tileKey: EMPTY_TILE_KEY, color: "" }));

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
