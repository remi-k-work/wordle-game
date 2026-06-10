// services, features, and other libraries
import { DateTime, Effect, Metric, Option, PubSub } from "effect";
import { Atom } from "effect/unstable/reactivity";
import { RuntimeAtom } from "@/lib/runtime-client";
import { applyGameAction, deriveGameEvent, finishRunSession, parseKey, resetCurrentRunSession, startRunSession } from "@/features/game/domain";
import { closeModalAction, gameDataSolutionsAtom, gameEventsPubSub, gameStateAtom, keypadColorsAtom, runSessionAtom } from ".";
import { arcadeRunLength, invalidGuesses, validGuesses, openingGuesses, runDeathReason, runsStarted } from "@/features/telemetry/domain";

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
    if (action._tag === "SubmitGuess") {
      // The new run session officially starts when the first guess is submitted
      const currRunSession = get(runSessionAtom);
      const nextRunSession = startRunSession(currRunSession, now);
      get.set(runSessionAtom, nextRunSession);

      // Extract the current run id
      const runId = Option.getOrElse(nextRunSession.runId, () => "unknown");

      if (nextGameState.isInvalidGuess) {
        // Invalid guess has been made
        yield* Metric.update(invalidGuesses.pipe(Metric.withAttributes({ runId })), 1);
      } else {
        // Must have been a valid guess otherwise
        yield* Metric.update(validGuesses.pipe(Metric.withAttributes({ runId })), 1);

        // Track the opening guess for the very first valid submission of the game
        if (currGameState.currentTurn === 1) yield* Metric.update(openingGuesses.pipe(Metric.withAttributes({ runId })), currGameState.currentGuessWord);
      }

      // *** TEST CODE ***
      const snapshots = yield* Metric.snapshot;
      yield* Effect.log("snapshots", snapshots);
      // *** TEST CODE ***
    }

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
    const runSession = get(runSessionAtom);

    // Track metrics before starting a new run
    yield* Metric.update(runsStarted, 1);

    // *** TEST CODE ***
    const runsStartedValue = yield* Metric.value(runsStarted);
    yield* Effect.log("runsStarted", runsStartedValue);
    // *** TEST CODE ***

    get.set(closeModalAction, void 0);
    get.set(runSessionAtom, resetCurrentRunSession(runSession));
    refreshActiveChallenge(get);
  })
);

// Manually abandon the current arcade run and record its final progress
export const forfeitRunAction = RuntimeAtom.fn(
  Effect.fn("forfeitRunAction")(function* (_: void, get: Atom.FnContext) {
    const runSession = get(runSessionAtom);

    // Track metrics before finishing the run session
    yield* Metric.update(arcadeRunLength, runSession.streak);
    yield* Metric.update(runDeathReason, "Forfeit");

    // *** TEST CODE ***
    const arcadeRunLengthValue = yield* Metric.value(arcadeRunLength);
    yield* Effect.log("arcadeRunLength", arcadeRunLengthValue);
    const runDeathReasonValue = yield* Metric.value(runDeathReason);
    yield* Effect.log("runDeathReason", Object.fromEntries(runDeathReasonValue.occurrences));
    // *** TEST CODE ***

    get.set(runSessionAtom, finishRunSession(runSession));
    refreshActiveChallenge(get);
  })
);
