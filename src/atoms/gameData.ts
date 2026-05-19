// services, features, and other libraries
import { Effect, HashSet, Random } from "effect";
import { Atom } from "@effect-atom/atom-react";
import { GameData } from "@/services";
import { gameStateAtom, languageAtom, Runtime } from ".";

// constants
import { INITIAL_GAME_STATE } from "@/domain";

// Effectful atom that fetches the solution dictionary and initializes a new word challenge
export const gameDataSolutionsAtom = Runtime.atom(
  Effect.gen(function* () {
    const language = yield* Atom.get(languageAtom);
    const service = yield* GameData;
    const solutions = yield* service.fetchSolutions(language);

    // Pick a new secret word and reset the game state
    const randomIndex = yield* Random.nextIntBetween(0, solutions.length);
    const randomSolution = solutions[randomIndex].toUpperCase();

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
