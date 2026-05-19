// services, features, and other libraries
import { Effect, Stream, Match, Option } from "effect";
import { Atom } from "@effect-atom/atom-react";
import { bankWordScore, calculateScore, finishRunSession } from "@/domain";
import { gameEventsPubSub, activeModalAtom, runSessionAtom, Runtime, gameStateAtom } from ".";

// Show the win/loss modal after tile animations have had time to finish
const showStatusModalAfterDelay = Effect.sleep("1.5 seconds").pipe(Effect.andThen(Atom.set(activeModalAtom, "status")), Effect.fork);

export const gameLifecycleAtom = Runtime.atom(
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

            // Trigger modal visibility after a delay (fork the UI delay so the stream consumer is not blocked)
            yield* showStatusModalAfterDelay;
          })
        ),

        // End the entire arcade run: record results and reset progress to zero
        Match.tag("WordLost", () =>
          Effect.gen(function* () {
            yield* Atom.update(runSessionAtom, finishRunSession);

            // Trigger modal visibility after a delay (fork the UI delay so the stream consumer is not blocked)
            yield* showStatusModalAfterDelay;
          })
        ),
        Match.exhaustive
      )
    )
  )
);
