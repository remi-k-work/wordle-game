// services, features, and other libraries
import { Effect, Stream, Match, Option } from "effect";
import { Atom } from "effect/unstable/reactivity";
import { RuntimeTelemetryStarter } from "@/lib/runtime-client";
import { bankWordScore, calculateScore, finishRunSession } from "@/features/game/domain";
import { gameEventsPubSub, runSessionAtom, gameStateAtom, modalMachineAtom } from ".";
import { trackWordLostEvent, trackWordWonEvent } from "@/features/telemetry/state";

// Show the win/loss modal after tile animations have had time to finish
const showStatusModalAfterDelay = Effect.sleep("1.5 seconds").pipe(
  Effect.andThen(Atom.set(modalMachineAtom, { type: "modal.opened", modalType: "status" })),
  Effect.forkDetach
);

export const gameLifecycleAtom = RuntimeTelemetryStarter.atom(
  Stream.fromPubSub(gameEventsPubSub).pipe(
    Stream.runForEach((event) =>
      Match.value(event).pipe(
        // Resolve the challenge: bank volatile points on win
        Match.tag("WordWon", ({ nextGameState, endTime }) =>
          Effect.gen(function* () {
            // Calculate the final score for the word
            const wordScore = calculateScore(nextGameState.currentTurn - 1, nextGameState.startTime, endTime);

            // Update the game state with the calculated score (so the UI can display it)
            yield* Atom.set(gameStateAtom, { ...nextGameState, wordScore: Option.some(wordScore) });

            // Bank volatile points into the persistent run session
            yield* Atom.update(runSessionAtom, (runSession) => bankWordScore(runSession, wordScore));

            // Track metrics related to the event of winning the game
            yield* trackWordWonEvent(nextGameState, wordScore);

            // Trigger modal visibility after a delay (fork the UI delay so the stream consumer is not blocked)
            yield* showStatusModalAfterDelay;
          })
        ),

        // End the entire arcade run: record results and reset progress to zero
        Match.tag("WordLost", ({ nextRunSession }) =>
          Effect.gen(function* () {
            // Track metrics related to the event of losing the game
            yield* trackWordLostEvent(nextRunSession);

            // Close out the active run and record it as the latest completed run
            yield* Atom.update(runSessionAtom, finishRunSession);

            // Trigger modal visibility after a delay (fork the UI delay so the stream consumer is not blocked)
            yield* showStatusModalAfterDelay;
          })
        ),
        Match.exhaustive
      )
    )
  )
).pipe(Atom.keepAlive);
