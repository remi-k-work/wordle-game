// services, features, and other libraries
import { DateTime, Effect, Metric, Option, PubSub } from "effect";
import { Atom } from "effect/unstable/reactivity";
import { RuntimeAtom } from "@/lib/runtime-client";
import { applyGameAction, deriveGameEvent, finishRunSession, parseKey, resetCurrentRunSession } from "@/features/game/domain";
import { closeModalAction, gameDataSolutionsAtom, gameEventsPubSub, gameStateAtom, keypadColorsAtom, runSessionAtom } from ".";
import { gameInvalidGuesses, gameValidGuesses } from "@/features/telemetry/domain";

// Central action handler for processing user input and managing state transitions
export const handleKeyAction = RuntimeAtom.fn(
  Effect.fn("handleKeyAction")(function* (pressedKey: string, get: Atom.FnContext) {
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

    // Track both invalid and valid guesses
    // if (action._tag === "SubmitGuess") {
    //   if (nextGameState.isInvalidGuess) {
    //     // Invalid guess has been made
    //     yield* Metric.update(gameInvalidGuesses, 1);
    //     const { count } = yield* Metric.value(gameInvalidGuesses);
    //     yield* Effect.log(`Invalid guesses: ${count}`);

    //     // yield* Effect.annotateCurrentSpan("game.guess_rejected", true);
    //     // yield* Effect.annotateCurrentSpan("game.attempted_word", nextGameState.currentGuessWord);
    //   } else {
    //     // Must have been a valid guess otherwise
    //     yield* Metric.update(gameValidGuesses, 1);
    //     const { count } = yield* Metric.value(gameValidGuesses);
    //     yield* Effect.log(`Valid guesses: ${count}`);
    //   }
    // }

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
    get.set(runSessionAtom, resetCurrentRunSession(get(runSessionAtom)));
    refreshActiveChallenge(get);
  })
);

// Manually abandon the current arcade run and record its final progress
export const forfeitRunAction = RuntimeAtom.fn(
  Effect.fn("forfeitRunAction")(function* (_: void, get: Atom.FnContext) {
    get.set(runSessionAtom, finishRunSession(get(runSessionAtom)));
    refreshActiveChallenge(get);
  })
);
