// services, features, and other libraries
import { DateTime, Effect, HashSet, Random, Match } from "effect";
import { Atom } from "@effect-atom/atom-react";
import { GameData } from "@/services";
import { deriveWordleGrid, getGameStatus, calculateScore, computeKeypadState, parseKey, applyGameAction, calculatePotentialScore } from "@/domain";
import { Runtime } from "./runtime";
import { activeModalAtom, closeModalAction, languageAtom, runSessionAtom } from ".";

// types
import type { GameState } from "@/domain";

// constants
import { INITIAL_GAME_STATE } from "@/domain";

// Primary state container for the active word challenge within the current arcade run
const gameStateAtom = Atom.make<GameState>(INITIAL_GAME_STATE);

// Specialized selectors for granular state access and optimized re-renders
export const theSecretWordAtom = gameStateAtom.pipe(Atom.map((state) => state.theSecretWord));
export const currentGuessWordAtom = gameStateAtom.pipe(Atom.map((state) => state.currentGuessWord));
export const wordleGuessesAtom = gameStateAtom.pipe(Atom.map((state) => state.wordleGuesses));
export const currentTurnAtom = gameStateAtom.pipe(Atom.map((state) => state.currentTurn));
export const isInvalidGuessAtom = gameStateAtom.pipe(Atom.map((state) => state.isInvalidGuess));
export const wordScoreAtom = gameStateAtom.pipe(Atom.map((state) => state.wordScore));
export const startTimeAtom = gameStateAtom.pipe(Atom.map((state) => state.startTime));

// Reactive selector for the "live" potential word score based on current progress
export const potentialScoreAtom = Atom.make((get) => {
  const currentTurn = get(currentTurnAtom);
  const startTime = get(startTimeAtom);
  const now = DateTime.unsafeNow();
  return calculatePotentialScore(currentTurn, startTime, now);
});

// Effectful atom that fetches the solution dictionary and initializes a new word challenge
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

// High-level progress indicator (Playing, Won, or Lost) for the current word
export const gameStatusAtom = Atom.make((get) => {
  const currentTurn = get(currentTurnAtom);
  const theSecretWord = get(theSecretWordAtom);
  const wordleGuesses = get(wordleGuessesAtom);
  return getGameStatus(currentTurn, theSecretWord, wordleGuesses);
});

// Central action handler for processing user input and managing state transitions
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

    // Resolve the challenge: bank volatile points on win, or end the entire run on loss
    const finalGameState = yield* Match.value(nextStatus).pipe(
      Match.when({ _tag: "Won" }, () =>
        Effect.gen(function* () {
          if (prevStatus._tag === "Playing" && nextGameState.startTime) {
            const endTime = yield* DateTime.now;
            const wordScore = calculateScore(nextGameState.currentTurn - 1, nextGameState.startTime, endTime);

            // Bank volatile points into the persistent run session
            const { runScore, streak, ...session } = get(runSessionAtom);
            const newRunScore = runScore + wordScore.wordScore;
            const newStreak = streak + 1;
            const newBestRunScore = Math.max(session.bestRunScore, newRunScore);

            get.set(runSessionAtom, { ...session, runScore: newRunScore, streak: newStreak, bestRunScore: newBestRunScore });

            return { ...nextGameState, wordScore };
          }
          return nextGameState;
        })
      ),
      Match.when({ _tag: "Lost" }, () =>
        Effect.gen(function* () {
          if (prevStatus._tag === "Playing") {
            // End the entire arcade run: record results and reset progress to zero
            const { runScore, streak, ...session } = get(runSessionAtom);
            get.set(runSessionAtom, { ...session, lastRunScore: runScore, lastRunStreak: streak, runScore: 0, streak: 0 });
          }
          return nextGameState;
        })
      ),
      Match.orElse(() => Effect.succeed(nextGameState))
    );

    // Update the game state atom
    get.set(gameStateAtom, finalGameState);

    // Trigger modal visibility as a side effect when the word resolution occurs
    if (prevStatus._tag === "Playing" && nextStatus._tag !== "Playing") {
      yield* Effect.sleep("1.5 seconds");
      get.set(activeModalAtom, "status");
    }
  })
);

// Transition to the next word challenge while maintaining the current run streak
export const nextWordAction = Atom.fn(
  Effect.fnUntraced(function* (_: void, get: Atom.FnContext) {
    get.set(closeModalAction, void 0);

    get.refresh(gameDataSolutionsAtom);
    get.refresh(gameDataKeypadAtom);
  })
);

// Wipe the current session and start a completely new arcade run from scratch
export const startNewRunAction = Atom.fn(
  Effect.fnUntraced(function* (_: void, get: Atom.FnContext) {
    get.set(closeModalAction, void 0);

    const session = get(runSessionAtom);
    get.set(runSessionAtom, { ...session, runScore: 0, streak: 0 });

    get.refresh(gameDataSolutionsAtom);
    get.refresh(gameDataKeypadAtom);
  })
);

// Manually abandon the current arcade run and record its final progress
export const forfeitRunAction = Atom.fn(
  Effect.fnUntraced(function* (_: void, get: Atom.FnContext) {
    const { runScore, streak, ...session } = get(runSessionAtom);
    get.set(runSessionAtom, { ...session, runScore: 0, streak: 0, lastRunScore: runScore, lastRunStreak: streak });

    get.refresh(gameDataSolutionsAtom);
    get.refresh(gameDataKeypadAtom);
  })
);
