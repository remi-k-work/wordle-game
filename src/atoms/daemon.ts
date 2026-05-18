// services, features, and other libraries
import { Effect, Stream, Match, Option } from "effect";
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
            const wordScore = calculateScore(nextGameState.currentTurn - 1, nextGameState.startTime, endTime);

            // Update the game state with the calculated score (so the UI can display it)
            yield* Atom.set(gameStateAtom, { ...nextGameState, wordScore: Option.some(wordScore) });

            // Bank volatile points into the persistent run session
            yield* Atom.update(runSessionAtom, ({ runScore, streak, bestRunScore, ...session }) => ({
              ...session,
              runScore: runScore + wordScore.wordScore,
              streak: streak + 1,
              bestRunScore: Math.max(bestRunScore, runScore + wordScore.wordScore),
            }));

            // Trigger modal visibility after a delay (fork the UI delay so the stream consumer is not blocked)
            yield* Effect.sleep("1.5 seconds").pipe(Effect.andThen(Atom.set(activeModalAtom, "status")), Effect.fork);
          })
        ),

        // End the entire arcade run: record results and reset progress to zero
        Match.tag("WordLost", () =>
          Effect.gen(function* () {
            yield* Atom.update(runSessionAtom, ({ runScore, streak, ...session }) => ({
              ...session,
              runScore: 0,
              streak: 0,
              lastRunScore: runScore,
              lastRunStreak: streak,
            }));

            // Trigger modal visibility after a delay (fork the UI delay so the stream consumer is not blocked)
            yield* Effect.sleep("1.5 seconds").pipe(Effect.andThen(Atom.set(activeModalAtom, "status")), Effect.fork);
          })
        ),
        Match.exhaustive
      )
    )
  )
);
