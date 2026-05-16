// services, features, and other libraries
import { DateTime, Effect, HashSet, Random, Match } from "effect";
import { Atom } from "@effect-atom/atom-react";
import { GameData } from "@/services";
import { deriveWordleGrid, getGameStatus, calculateScore, computeKeypadState, parseKey, applyGameAction, calculatePotentialScore } from "@/domain";
import { Runtime } from "./runtime";
import { activeModalAtom, languageAtom, sessionAtom } from ".";

// types
import type { GameState } from "@/domain";

// constants
import { INITIAL_GAME_STATE } from "@/domain";

// Primary state container for the active game session
const gameStateAtom = Atom.make<GameState>(INITIAL_GAME_STATE);

// Specialized selectors for granular state access and optimized re-renders
export const theSecretWordAtom = gameStateAtom.pipe(Atom.map((state) => state.theSecretWord));
export const currentGuessWordAtom = gameStateAtom.pipe(Atom.map((state) => state.currentGuessWord));
export const wordleGuessesAtom = gameStateAtom.pipe(Atom.map((state) => state.wordleGuesses));
export const currentTurnAtom = gameStateAtom.pipe(Atom.map((state) => state.currentTurn));
export const isInvalidGuessAtom = gameStateAtom.pipe(Atom.map((state) => state.isInvalidGuess));
export const scoreAtom = gameStateAtom.pipe(Atom.map((state) => state.score));
export const startTimeAtom = gameStateAtom.pipe(Atom.map((state) => state.startTime));

// Reactive selector for real-time score projection
export const potentialScoreAtom = Atom.make((get) => {
  const currentTurn = get(currentTurnAtom);
  const startTime = get(startTimeAtom);
  const now = DateTime.unsafeNow();
  return calculatePotentialScore(currentTurn, startTime, now);
});

// Effectful atom that fetches the solution dictionary and initializes a new secret word
export const gameDataSolutionsAtom = Runtime.atom(
  Effect.gen(function* () {
    const language = yield* Atom.get(languageAtom);
    const service = yield* GameData;
    const solutions = yield* service.fetchSolutions(language);

    // Pick a new secret word and reset the game state
    const randomIndex = yield* Random.nextIntBetween(0, solutions.length);
    const randomSolution = solutions[randomIndex].toUpperCase();

    // *** TEST CODE ***
    // *** TEST CODE ***
    // *** TEST CODE ***
    yield* Effect.log("Secret word: " + randomSolution);
    // *** TEST CODE ***
    // *** TEST CODE ***
    // *** TEST CODE ***

    yield* Atom.set(gameStateAtom, { ...INITIAL_GAME_STATE, theSecretWord: randomSolution });

    // Return as a HashSet for O(1) lookups
    return HashSet.fromIterable(solutions.map((solution) => solution.toUpperCase()));
  })
);

// Effectful atom that fetches the valid keypad layout for the selected language
export const gameDataKeypadAtom = Runtime.atom(
  Effect.gen(function* () {
    const language = yield* Atom.get(languageAtom);
    const service = yield* GameData;
    return yield* service.fetchKeypad(language);
  })
);

// Reset the entire game state by refreshing the underlying data sources
export const restartGameAction = Atom.fn(() =>
  Effect.gen(function* () {
    yield* Atom.refresh(gameDataSolutionsAtom);
    yield* Atom.refresh(gameDataKeypadAtom);
  })
);

// View-ready representation of the 6x5 game grid derived from current guesses
export const wordleGridAtom = Atom.make((get) => {
  const theSecretWord = get(theSecretWordAtom);
  const wordleGuesses = get(wordleGuessesAtom);
  return deriveWordleGrid(theSecretWord, wordleGuesses);
});

// Current coloring state of the keypad keys based on guess history
export const keypadColorsAtom = Atom.make((get) => {
  const theSecretWord = get(theSecretWordAtom);
  const wordleGuesses = get(wordleGuessesAtom);
  return computeKeypadState(theSecretWord, wordleGuesses);
});

// High-level game progress indicator (Playing, Won, or Lost)
export const gameStatusAtom = Atom.make((get) => {
  const currentTurn = get(currentTurnAtom);
  const theSecretWord = get(theSecretWordAtom);
  const wordleGuesses = get(wordleGuessesAtom);
  return getGameStatus(currentTurn, theSecretWord, wordleGuesses);
});

// Central action handler for processing user input and executing state transitions
export const handleKeyAction = Atom.fn((pressedKey: string, get) =>
  Effect.gen(function* () {
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

    // Detect transitions
    const prevStatus = getGameStatus(currGameState.currentTurn, currGameState.theSecretWord, currGameState.wordleGuesses);
    const nextStatus = getGameStatus(nextGameState.currentTurn, nextGameState.theSecretWord, nextGameState.wordleGuesses);

    // Calculate and attach the final score upon a successful game resolution
    const finalGameState = yield* Match.value(nextStatus).pipe(
      Match.when({ _tag: "Won" }, () =>
        Effect.gen(function* () {
          if (prevStatus._tag === "Playing" && nextGameState.startTime) {
            const endTime = yield* DateTime.now;
            const score = calculateScore(nextGameState.currentTurn - 1, nextGameState.startTime, endTime);

            // Update persistent session
            const session = yield* Atom.get(sessionAtom);
            const newTotalScore = session.totalScore + score.totalScore;
            const newStreak = session.currentStreak + 1;
            const newBestRun = Math.max(session.bestRun, newTotalScore);

            yield* Atom.set(sessionAtom, { totalScore: newTotalScore, currentStreak: newStreak, bestRun: newBestRun });

            return { ...nextGameState, score };
          }
          return nextGameState;
        })
      ),
      Match.when({ _tag: "Lost" }, () =>
        Effect.gen(function* () {
          if (prevStatus._tag === "Playing") {
            // Reset session on loss
            const session = yield* Atom.get(sessionAtom);
            yield* Atom.set(sessionAtom, { ...session, totalScore: 0, currentStreak: 0 });
          }
          return nextGameState;
        })
      ),
      Match.orElse(() => Effect.succeed(nextGameState))
    );

    // Update the game state atom
    yield* Atom.set(gameStateAtom, finalGameState);

    // Trigger modal visibility as a side effect when the game concludes
    if (prevStatus._tag === "Playing" && nextStatus._tag !== "Playing") {
      yield* Effect.sleep("1.5 seconds");
      yield* Atom.set(activeModalAtom, "status");
    }
  })
);
