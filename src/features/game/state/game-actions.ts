// services, features, and other libraries
import { DateTime, Effect, Option, PubSub } from "effect";
import { Atom } from "effect/unstable/reactivity";
import { RuntimeAtom } from "@/lib/runtime-client";
import { applyGameAction, deriveGameEvent, finishRunSession, parseKey, resetCurrentRunSession } from "@/features/game/domain";
import { modalMachineAtom, gameDataSolutionsAtom, gameEventsPubSub, gameStateAtom, keypadColorsAtom, runSessionAtom } from ".";
import { trackForfeitRunAction, trackStartNewRunAction, trackSubmitGuessAction } from "@/features/telemetry/state";

// Central action handler for processing user input and managing state transitions
export const handleKeyAction = RuntimeAtom.fn(
  Effect.fnUntraced(function* (pressedKey: string, get: Atom.FnContext) {
    const currGameState = get(gameStateAtom);
    const currRunSession = get(runSessionAtom);
    const keypadColors = get(keypadColorsAtom);

    // Map raw input to domain action and exit early if it is junk
    const gameAction = parseKey(pressedKey, keypadColors);
    if (gameAction._tag === "Ignore") return;

    // Gather pure dependencies
    const dictionary = yield* get.result(gameDataSolutionsAtom);
    const now = yield* DateTime.now;

    // Process via purely functional domain logic
    const [nextGameState, nextRunSession] = applyGameAction(currGameState, currRunSession, gameAction, dictionary, now);

    // Referential equality check (anything has changed?)
    if (currGameState === nextGameState && currRunSession === nextRunSession) return;

    if (gameAction._tag === "SubmitGuess") {
      // Track metrics related to the action of submitting a new guess
      yield* trackSubmitGuessAction(currGameState, nextGameState);
    }

    // Update both game state and run session atoms
    get.set(gameStateAtom, nextGameState);
    get.set(runSessionAtom, nextRunSession);

    yield* Option.match(deriveGameEvent(currGameState, nextGameState, nextRunSession, now), {
      onNone: () => Effect.void,
      onSome: (event) => PubSub.publish(gameEventsPubSub, event),
    });
  })
);

// Refresh the dictionary-backed atoms that define the current word challenge
const refreshActiveChallenge = (get: Atom.FnContext) => {
  get.refresh(gameDataSolutionsAtom);
};

// Transition to the next word challenge while maintaining the current run streak
export const nextWordAction = Atom.fn(
  Effect.fnUntraced(function* (_: void, get: Atom.FnContext) {
    get.set(modalMachineAtom, { type: "modal.closed" });
    refreshActiveChallenge(get);
  })
);

// Wipe the current session and start a completely new arcade run from scratch
export const startNewRunAction = Atom.fn(
  Effect.fnUntraced(function* (_: void, get: Atom.FnContext) {
    // Track metrics related to the action of starting a new run
    yield* trackStartNewRunAction();

    get.set(modalMachineAtom, { type: "modal.closed" });
    get.set(runSessionAtom, resetCurrentRunSession(get(runSessionAtom)));
    refreshActiveChallenge(get);
  })
);

// Manually abandon the current arcade run and record its final progress
export const forfeitRunAction = RuntimeAtom.fn(
  Effect.fnUntraced(function* (_: void, get: Atom.FnContext) {
    // Track metrics related to the action of forfeiting a run
    yield* trackForfeitRunAction();

    get.set(runSessionAtom, finishRunSession(get(runSessionAtom)));
    refreshActiveChallenge(get);
  })
);
