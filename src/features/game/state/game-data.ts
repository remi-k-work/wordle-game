// services, features, and other libraries
import { Effect, HashSet, Random } from "effect";
import { Atom } from "@effect-atom/atom-react";
import { RuntimeAtom } from "@/lib/runtime-client";
import { RpcGameClient } from "@/features/game/rpc/client";
import { gameStateAtom, solutionsLanguageAtom, theSecretWordAtom } from ".";

// constants
import { INITIAL_GAME_STATE } from "@/features/game/domain";

// Effectful atom that fetches the solution dictionary and initializes a new word challenge
export const gameDataSolutionsAtom = RuntimeAtom.atom((get) =>
  Effect.gen(function* () {
    const solutionsLanguage = get(solutionsLanguageAtom);

    const { fetchSolutions } = yield* RpcGameClient;
    const solutions = yield* fetchSolutions({ solutionsLanguage });

    // Pick a new secret word and reset the game state
    const randomIndex = yield* Random.nextIntBetween(0, solutions.length);
    const theSecretWord = solutions[randomIndex].toUpperCase();

    // *** TEST CODE ***
    // *** TEST CODE ***
    // *** TEST CODE ***
    yield* Effect.log(`Secret word: ${theSecretWord}`);
    // *** TEST CODE ***
    // *** TEST CODE ***
    // *** TEST CODE ***

    yield* Atom.set(gameStateAtom, { ...INITIAL_GAME_STATE, theSecretWord });

    // Return as a HashSet for O(1) lookups
    return HashSet.fromIterable(solutions.map((solution) => solution.toUpperCase()));
  }).pipe(Effect.delay("3 seconds"))
).pipe(Atom.keepAlive);

// Effectful atom that fetches the valid keypad layout for the selected language
export const gameDataKeypadAtom = RuntimeAtom.atom((get) =>
  Effect.gen(function* () {
    const solutionsLanguage = get(solutionsLanguageAtom);

    const { fetchKeypad } = yield* RpcGameClient;
    return yield* fetchKeypad({ solutionsLanguage });
  })
).pipe(Atom.keepAlive);

// Effectful atom that reactively fetches a riddle whenever the secret word or language changes
export const riddleAtom = RuntimeAtom.atom((get) =>
  Effect.gen(function* () {
    const theSecretWord = get(theSecretWordAtom);
    const solutionsLanguage = get(solutionsLanguageAtom);

    const { fetchRiddle } = yield* RpcGameClient;
    return yield* fetchRiddle({ theSecretWord, solutionsLanguage });
  }).pipe(Effect.delay("3 seconds"))
).pipe(Atom.keepAlive);

// Effectful atom that reactively fetches the secret word definition
export const wordDefinitionAtom = RuntimeAtom.atom(
  Effect.gen(function* () {
    const solutionsLanguage = yield* Atom.get(solutionsLanguageAtom);
    const theSecretWord = yield* Atom.get(theSecretWordAtom);

    const { wordDefinition } = yield* RpcGameClient;
    return yield* wordDefinition({ solutionsLanguage, theSecretWord });
  })
);
