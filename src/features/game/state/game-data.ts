// services, features, and other libraries
import { Effect, HashSet, Random } from "effect";
import { Atom } from "effect/unstable/reactivity";
import { RuntimeAtom } from "@/lib/runtime-client";
import { RpcGameClient } from "@/features/game/rpc/client";
import { solutionsLanguageAtom } from "@/features/settings/state";
import { gameStateAtom, theSecretWordAtom } from ".";

// constants
import { INITIAL_GAME_STATE } from "@/features/game/domain";

// Effectful atom that fetches the solution dictionary and initializes a new word challenge
export const gameDataSolutionsAtom = RuntimeAtom.atom(
  Effect.fnUntraced(function* (get) {
    yield* Effect.sleep("1 seconds");

    const solutionsLanguage = get(solutionsLanguageAtom);

    const { fetchSolutions, fetchDictionary } = yield* RpcGameClient;
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

    // This is the more forgiving dictionary of valid words we can enter (no lemmas only)
    const dictionary = yield* fetchDictionary({ solutionsLanguage });

    // Return as a HashSet for O(1) lookups
    return HashSet.fromIterable(dictionary.map((word) => word.toUpperCase()));
  })
).pipe(Atom.keepAlive);

// Effectful atom that fetches the valid keypad layout for the selected language
export const gameDataKeypadAtom = RuntimeAtom.atom(
  Effect.fnUntraced(function* (get) {
    const solutionsLanguage = get(solutionsLanguageAtom);

    const { fetchKeypad } = yield* RpcGameClient;
    return yield* fetchKeypad({ solutionsLanguage });
  })
).pipe(Atom.keepAlive);

// Effectful atom that reactively fetches a riddle whenever the secret word or language changes
export const riddleAtom = RuntimeAtom.atom(
  Effect.fnUntraced(function* (get) {
    yield* Effect.sleep("3 seconds");

    const theSecretWord = get(theSecretWordAtom);
    const solutionsLanguage = get(solutionsLanguageAtom);

    const { fetchRiddle } = yield* RpcGameClient;
    return yield* fetchRiddle({ theSecretWord, solutionsLanguage });
  })
).pipe(Atom.keepAlive);

// Effectful atom that reactively fetches the secret word definition
export const wordDefinitionAtom = RuntimeAtom.atom(
  Effect.fnUntraced(function* () {
    const solutionsLanguage = yield* Atom.get(solutionsLanguageAtom);
    const theSecretWord = yield* Atom.get(theSecretWordAtom);

    const { wordDefinition } = yield* RpcGameClient;
    return yield* wordDefinition({ solutionsLanguage, theSecretWord });
  })
);
