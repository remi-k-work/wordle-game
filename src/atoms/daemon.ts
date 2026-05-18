// services, features, and other libraries
import { Effect, Stream, Match } from "effect";
import { Atom } from "@effect-atom/atom-react";
import { calculateScore } from "@/domain";
import { gameEventsPubSub, activeModalAtom, runSessionAtom, Runtime, gameStateAtom } from "@/atoms";

export const gameLifecycleAtom = Runtime.atom(
  Stream.fromPubSub(gameEventsPubSub).pipe(
    Stream.runForEach((event) =>
      Match.value(event).pipe(
        // Resolve the challenge: bank volatile points on win
        Match.tag("WordWon", ({ nextGameState, endTime }) =>
          Effect.gen(function* () {
            // Calculate the final score for the word
            const wordScore = calculateScore(nextGameState.currentTurn - 1, nextGameState.startTime!, endTime);

            // Update the game state with the calculated score (so the UI can display it)
            yield* Atom.set(gameStateAtom, { ...nextGameState, wordScore });

            // Bank volatile points into the persistent run session
            const { runScore, streak, bestRunScore, ...session } = yield* Atom.get(runSessionAtom);
            yield* Atom.set(runSessionAtom, {
              ...session,
              runScore: runScore + wordScore.wordScore,
              streak: streak + 1,
              bestRunScore: Math.max(bestRunScore, runScore + wordScore.wordScore),
            });

            // Trigger modal visibility after a delay
            yield* Effect.sleep("1.5 seconds");
            yield* Atom.set(activeModalAtom, "status");
          })
        ),

        // End the entire arcade run: record results and reset progress to zero
        Match.tag("WordLost", () =>
          Effect.gen(function* () {
            const { runScore, streak, ...session } = yield* Atom.get(runSessionAtom);
            yield* Atom.set(runSessionAtom, { ...session, runScore: 0, streak: 0, lastRunScore: runScore, lastRunStreak: streak });

            // Trigger modal visibility after a delay
            yield* Effect.sleep("1.5 seconds");
            yield* Atom.set(activeModalAtom, "status");
          })
        ),
        Match.exhaustive
      )
    )
  )
);
