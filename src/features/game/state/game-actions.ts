// services, features, and other libraries
import { DateTime, Effect } from "effect";
import { Atom } from "effect/unstable/reactivity";
import { RuntimeAtom } from "@/lib/runtime-client";
import { applyGameAction, canSubmitGuess, finishRunSession, getGameStatus, parseKey, resetCurrentRunSession } from "@/features/game/domain";
import { modalMachineAtom, gameDataSolutionsAtom, gameStateAtom, keypadColorsAtom, runSessionAtom, turnMachineAtom } from ".";
import { trackForfeitRunAction, trackStartNewRunAction, trackSubmitGuessAction } from "@/features/telemetry/state";

// constants
import { WORD_LENGTH } from "@/features/game/domain";

// Central action handler for processing user input and managing state transitions
export const handleKeyAction = RuntimeAtom.fn(
  Effect.fnUntraced(function* (pressedKey: string, get: Atom.FnContext) {
    const turnMachineSnapshot = get(turnMachineAtom);

    // Absolute Input Lock: ignore keys if processing animations or game is over
    if (turnMachineSnapshot.matches("revealing") || turnMachineSnapshot.matches("gameOver")) return;

    // Auto-Recovery: typing a new character instantly dismisses the row error shake
    if (turnMachineSnapshot.matches("rejected")) get.set(turnMachineAtom, { type: "turn.cleared" });

    const currGameState = get(gameStateAtom);
    const keypadColors = get(keypadColorsAtom);

    // Map raw input to domain action and exit early if it is junk
    const gameAction = parseKey(pressedKey, keypadColors);
    if (gameAction._tag === "Ignore") return;

    // Gather pure dependencies
    const dictionary = yield* get.result(gameDataSolutionsAtom);
    const now = yield* DateTime.now;

    // --- GATEKEEPER ---
    if (gameAction._tag === "SubmitGuess") {
      const { currentGuessWord, currentTurn, wordleGuesses, theSecretWord } = currGameState;

      // Silently ignore ENTER on incomplete words
      if (currentGuessWord.length < WORD_LENGTH) return;

      // Pure validation
      const isValid = canSubmitGuess(currentGuessWord, currentTurn, wordleGuesses, dictionary);

      // Project the future status so the machine knows where to go after animating
      const predictedStatus = isValid ? getGameStatus(currentTurn + 1, theSecretWord, [...wordleGuesses, currentGuessWord])._tag : "Playing";

      // Instantly pass the payload to the machine to let it route itself
      get.set(turnMachineAtom, { type: "turn.submitted", isValid, status: predictedStatus });

      // Track metrics (this works now because the machine is already in "rejected" if invalid!)
      yield* trackSubmitGuessAction(currGameState);

      // Exit early if invalid; do not touch the pure game state
      if (!isValid) return;
    }

    // --- STATE UPDATE ---
    const currRunSession = get(runSessionAtom);
    const [nextGameState, nextRunSession] = applyGameAction(currGameState, currRunSession, gameAction, now);

    get.set(gameStateAtom, nextGameState);
    get.set(runSessionAtom, nextRunSession);
  })
);

// Refresh the dictionary-backed atoms that define the current word challenge
const refreshActiveChallenge = (get: Atom.FnContext) => {
  get.refresh(gameDataSolutionsAtom);
};

// Transition to the next word challenge while maintaining the current run streak
export const nextWordAction = Atom.fn(
  Effect.fnUntraced(function* (_: void, get: Atom.FnContext) {
    // Reset the turn lifecycle when moving onto a fresh word challenge
    get.set(turnMachineAtom, { type: "turn.reset" });

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
