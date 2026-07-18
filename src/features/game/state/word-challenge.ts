// services, features, and other libraries
import { Array, DateTime, Option, pipe } from "effect";
import { Atom } from "effect/unstable/reactivity";
import { createActor } from "xstate";
import { wordChallengeMachine } from "@/features/game/machines/word-challenge";
import { calculatePotentialScore, computeKeypadState, formatGuess } from "@/features/game/domain";
import { inspect } from "@/machines/inspect";

// types
import type { Actor, EventFromLogic, SnapshotFrom } from "xstate";
import type { Color } from "@/features/game/domain";

type WordChallengeMachineSnapshot = SnapshotFrom<typeof wordChallengeMachine>;
type WordChallengeMachineEvent = EventFromLogic<typeof wordChallengeMachine>;
type WordChallengeMachineActor = Actor<typeof wordChallengeMachine>;

// constants
import { MAX_TURNS, WORD_LENGTH } from "@/features/game/domain";

// Creates an Atom-owned XState actor reference
const wordChallengeMachineActorAtom = Atom.make<WordChallengeMachineActor>((get) => {
  const actor = createActor(wordChallengeMachine, { inspect });
  actor.start();

  get.addFinalizer(() => {
    actor.stop();
  });

  return actor;
}).pipe(Atom.keepAlive);

// The word challenge machine is now a living actor inside the effect atom
export const wordChallengeMachineAtom = Atom.writable<WordChallengeMachineSnapshot, WordChallengeMachineEvent>(
  (get) => {
    const actor = get(wordChallengeMachineActorAtom);
    const subscription = actor.subscribe((snapshot) => {
      get.setSelf(snapshot);
    });

    get.addFinalizer(() => {
      subscription.unsubscribe();
    });

    return actor.getSnapshot();
  },
  (ctx, event) => {
    ctx.get(wordChallengeMachineActorAtom).send(event);
  }
).pipe(Atom.keepAlive);

// Specialized selectors for granular state access and optimized re-renders
export const wordChallengeTheSecretWordAtom = wordChallengeMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.theSecretWord));
export const wordChallengeCurrentGuessWordAtom = wordChallengeMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.currentGuessWord));
export const wordChallengeWordleGuessesAtom = wordChallengeMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.wordleGuesses));
export const wordChallengeCurrentTurnAtom = wordChallengeMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.currentTurn));
export const wordChallengeStartTimeAtom = wordChallengeMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.startTime));
export const wordChallengeWordScoreAtom = wordChallengeMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.wordScore));

// Reactive selector for the "live" potential word score based on current progress
export const potentialScoreAtom = Atom.make((get) =>
  calculatePotentialScore(get(wordChallengeCurrentTurnAtom), get(wordChallengeStartTimeAtom), DateTime.makeUnsafe(Date.now()))
);

// Derive the full 6x5 grid state for rendering based on completed guesses
export const wordleGridAtom = Atom.make((get) =>
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

// Current coloring state of the keypad keys based on guess history
export const keypadColorsAtom = Atom.make((get) =>
  Option.match(get(wordChallengeTheSecretWordAtom), {
    onNone: () => ({}) as Record<string, Color>,
    onSome: (theSecretWord) => computeKeypadState(theSecretWord, get(wordChallengeWordleGuessesAtom)),
  })
);
