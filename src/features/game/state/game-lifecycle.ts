// services, features, and other libraries
import { Effect, Stream, Match, Option, Metric } from "effect";
import { Atom } from "effect/unstable/reactivity";
import { RuntimeAtom } from "@/lib/runtime-client";
import { bankWordScore, calculateScore, finishRunSession } from "@/features/game/domain";
import { gameEventsPubSub, activeModalAtom, runSessionAtom, gameStateAtom } from ".";
import { arcadeRunLength, failedWords, gamesPlayed, guessesToWin, perfectGames, runDeathReason, timeToSolve } from "@/features/telemetry/domain";

// Show the win/loss modal after tile animations have had time to finish
const showStatusModalAfterDelay = Effect.sleep("1.5 seconds").pipe(Effect.andThen(Atom.set(activeModalAtom, "status")), Effect.forkDetach);

export const gameLifecycleAtom = RuntimeAtom.atom(
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

            // Track win-related metrics
            const guessedTurn = nextGameState.currentTurn - 1;
            yield* Metric.update(guessesToWin, guessedTurn);
            yield* Metric.update(timeToSolve, wordScore.timeSeconds);
            yield* Metric.update(gamesPlayed, 1);
            if (guessedTurn === 1) yield* Metric.update(perfectGames, 1);

            // *** TEST CODE ***
            const guessesToWinValue = yield* Metric.value(guessesToWin);
            yield* Effect.log("guessesToWin", guessesToWinValue);
            const timeToSolveValue = yield* Metric.value(timeToSolve);
            yield* Effect.log("timeToSolve", timeToSolveValue);
            const gamesPlayedValue = yield* Metric.value(gamesPlayed);
            yield* Effect.log("gamesPlayed", gamesPlayedValue);
            const perfectGamesValue = yield* Metric.value(perfectGames);
            yield* Effect.log("perfectGames", perfectGamesValue);
            // *** TEST CODE ***

            // Trigger modal visibility after a delay (fork the UI delay so the stream consumer is not blocked)
            yield* showStatusModalAfterDelay;
          })
        ),

        // End the entire arcade run: record results and reset progress to zero
        Match.tag("WordLost", () =>
          Effect.gen(function* () {
            const runSession = yield* Atom.get(runSessionAtom);
            const gameState = yield* Atom.get(gameStateAtom);

            // Track loss-related metrics before resetting the session
            yield* Metric.update(gamesPlayed, 1);
            yield* Metric.update(arcadeRunLength, runSession.streak);
            yield* Metric.update(failedWords, gameState.theSecretWord);
            yield* Metric.update(runDeathReason, "Guesses");

            // *** TEST CODE ***
            const gamesPlayedValue = yield* Metric.value(gamesPlayed);
            yield* Effect.log("gamesPlayed", gamesPlayedValue);
            const arcadeRunLengthValue = yield* Metric.value(arcadeRunLength);
            yield* Effect.log("arcadeRunLength", arcadeRunLengthValue);
            const failedWordsValue = yield* Metric.value(failedWords);
            yield* Effect.log("failedWords", Object.fromEntries(failedWordsValue.occurrences));
            const runDeathReasonValue = yield* Metric.value(runDeathReason);
            yield* Effect.log("runDeathReason", Object.fromEntries(runDeathReasonValue.occurrences));
            // *** TEST CODE ***

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
