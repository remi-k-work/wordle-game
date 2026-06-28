// services, features, and other libraries
import { Effect, Option, DateTime } from "effect";
import { Atom } from "effect/unstable/reactivity";
import { RuntimeTelemetryStarter } from "@/lib/runtime-client";
import { bankWordScore, calculateScore, finishRunSession, getGameStatus } from "@/features/game/domain";
import { runSessionAtom, gameStateAtom, modalMachineAtom, turnMachineAtom } from ".";
import { trackWordLostEvent, trackWordWonEvent } from "@/features/telemetry/state";

export const gameLifecycleAtom = RuntimeTelemetryStarter.atom(
  Effect.fnUntraced(function* (get) {
    // This is our only reactive subscription; it triggers when the turn machine changes states
    const turnMachineSnapshot = get(turnMachineAtom);

    // This process layer only wakes up the exact frame the turn machine hits gameOver
    if (!turnMachineSnapshot.matches("gameOver")) return;

    // Read current states imperatively without subscribing; this prevents the infinite loop!
    const currentGameState = yield* Atom.get(gameStateAtom);
    const currentRunSession = yield* Atom.get(runSessionAtom);

    const gameStatus = getGameStatus(currentGameState.currentTurn, currentGameState.theSecretWord, currentGameState.wordleGuesses);
    const endTime = yield* DateTime.now;

    // Resolve the challenge: bank volatile points on win
    if (gameStatus._tag === "Won") {
      // Calculate the final score for the word
      const wordScore = calculateScore(currentGameState.currentTurn - 1, currentGameState.startTime, endTime);

      // Update the game state with the calculated score (so the UI can display it)
      yield* Atom.set(gameStateAtom, { ...currentGameState, wordScore: Option.some(wordScore) });

      // Bank volatile points into the persistent run session
      yield* Atom.update(runSessionAtom, (runSession) => bankWordScore(runSession, wordScore));

      // Track metrics related to the event of winning the game
      yield* trackWordWonEvent(currentGameState, wordScore);
    } else if (gameStatus._tag === "Lost") {
      // Track metrics related to the event of losing the game
      yield* trackWordLostEvent(currentRunSession);

      // Close out the active run and record it as the latest completed run
      yield* Atom.update(runSessionAtom, finishRunSession);
    }

    // Open the modal instantly because the 1.5s delay safely occurred inside the turn machine
    yield* Atom.set(modalMachineAtom, { type: "modal.opened", modalType: "status" });
  })
).pipe(Atom.keepAlive);
