// services, features, and other libraries
import { Effect, HashSet, Random } from "effect";
import { Atom } from "@effect-atom/atom-react";
import { RuntimeAtom } from "@/lib/RuntimeClient";
import { GameData } from "@/services";
import { gameStateAtom, languageAtom } from ".";

// constants
import { INITIAL_GAME_STATE } from "@/domain";

// Effectful atom that fetches the solution dictionary and initializes a new word challenge
export const gameDataSolutionsAtom = RuntimeAtom.atom(
  Effect.gen(function* () {
    const language = yield* Atom.get(languageAtom);
    const gameData = yield* GameData;
    const solutions = yield* gameData.fetchSolutions(language);

    // Pick a new secret word and reset the game state
    const randomIndex = yield* Random.nextIntBetween(0, solutions.length);
    const randomSolution = solutions[randomIndex].toUpperCase();
    const riddle = yield* gameData.fetchRiddle(randomSolution, language);

    // *** TEST CODE ***
    // *** TEST CODE ***
    // *** TEST CODE ***
    yield* Effect.log(`Secret word: ${randomSolution}`);
    yield* Effect.log(`Riddle: ${riddle}`);
    // *** TEST CODE ***
    // *** TEST CODE ***
    // *** TEST CODE ***

    yield* Atom.set(gameStateAtom, { ...INITIAL_GAME_STATE, theSecretWord: randomSolution, riddle });

    // Return as a HashSet for O(1) lookups
    return HashSet.fromIterable(solutions.map((solution) => solution.toUpperCase()));
  })
);

// Effectful atom that fetches the valid keypad layout for the selected language
export const gameDataKeypadAtom = RuntimeAtom.atom(
  Effect.gen(function* () {
    const language = yield* Atom.get(languageAtom);
    const gameData = yield* GameData;
    return yield* gameData.fetchKeypad(language);
  })
);
