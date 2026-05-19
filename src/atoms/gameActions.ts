// services, features, and other libraries
import { DateTime, Effect, Option, PubSub } from "effect";
import { Atom } from "@effect-atom/atom-react";
import { applyGameAction, deriveGameEvent, finishRunSession, parseKey, resetCurrentRunSession } from "@/domain";
import { closeModalAction, gameDataKeypadAtom, gameDataSolutionsAtom, gameEventsPubSub, gameStateAtom, keypadColorsAtom, runSessionAtom } from ".";

// Central action handler for processing user input and managing state transitions
export const handleKeyAction = Atom.fn((pressedKey: string, get) =>
  Effect.gen(function* () {
    const currGameState = get(gameStateAtom);
    const keypadColors = get(keypadColorsAtom);

    // Map raw input to domain action and exit early if it is junk
    const action = parseKey(pressedKey, keypadColors);
    if (action._tag === "Ignore") return;

    // Gather pure dependencies
    const dictionary = yield* get.result(gameDataSolutionsAtom);
    const now = yield* DateTime.now;

    // Process via purely functional domain logic
    const nextGameState = applyGameAction(currGameState, action, dictionary, now);

    // Referential equality check (anything has changed?)
    if (currGameState === nextGameState) return;

    // Update the game state atom
    get.set(gameStateAtom, nextGameState);

    yield* Option.match(deriveGameEvent(currGameState, nextGameState, now), {
      onNone: () => Effect.void,
      onSome: (event) => PubSub.publish(gameEventsPubSub, event),
    });
  })
);

// Refresh the dictionary-backed atoms that define the current word challenge
const refreshActiveChallenge = (get: Atom.FnContext) => {
  get.refresh(gameDataSolutionsAtom);
  get.refresh(gameDataKeypadAtom);
};

// Transition to the next word challenge while maintaining the current run streak
export const nextWordAction = Atom.fn(
  Effect.fnUntraced(function* (_: void, get: Atom.FnContext) {
    get.set(closeModalAction, void 0);

    refreshActiveChallenge(get);
  })
);

// Wipe the current session and start a completely new arcade run from scratch
export const startNewRunAction = Atom.fn(
  Effect.fnUntraced(function* (_: void, get: Atom.FnContext) {
    get.set(closeModalAction, void 0);

    const runSession = get(runSessionAtom);
    get.set(runSessionAtom, resetCurrentRunSession(runSession));

    refreshActiveChallenge(get);
  })
);

// Manually abandon the current arcade run and record its final progress
export const forfeitRunAction = Atom.fn(
  Effect.fnUntraced(function* (_: void, get: Atom.FnContext) {
    get.set(runSessionAtom, finishRunSession(get(runSessionAtom)));

    refreshActiveChallenge(get);
  })
);
