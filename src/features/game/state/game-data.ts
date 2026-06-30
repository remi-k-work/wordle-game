// services, features, and other libraries
import { Effect, Option } from "effect";
import { Atom } from "effect/unstable/reactivity";
import { RuntimeAtom } from "@/lib/runtime-client";
import { RpcGameClient } from "@/features/game/rpc/client";
import { solutionsLanguageAtom } from "@/features/settings/state";
import { wordChallengeMachineAtom, wordChallengeTheSecretWordAtom } from ".";

// Effectful atom that fetches the solution dictionary and initializes a new word challenge
export const gameDataSolutionsAtom = RuntimeAtom.atom(
  Effect.fnUntraced(function* (get) {
    yield* Effect.sleep("1 seconds");

    const solutionsLanguage = get(solutionsLanguageAtom);

    const { fetchSolutions, fetchDictionary } = yield* RpcGameClient;
    const solutions = yield* fetchSolutions({ solutionsLanguage });
    const dictionary = yield* fetchDictionary({ solutionsLanguage });

    // Notify the word challenge machine that the solutions have been loaded
    yield* Atom.set(wordChallengeMachineAtom, {
      type: "solutionsLoaded",
      solutions: Option.some(solutions),
      dictionary: Option.some(dictionary),
    });
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

    const theSecretWord = get(wordChallengeTheSecretWordAtom);
    const solutionsLanguage = get(solutionsLanguageAtom);

    const { fetchRiddle } = yield* RpcGameClient;
    return yield* fetchRiddle({ theSecretWord, solutionsLanguage });
  })
).pipe(Atom.keepAlive);

// Effectful atom that reactively fetches the secret word definition
export const wordDefinitionAtom = RuntimeAtom.atom(
  Effect.fnUntraced(function* () {
    const solutionsLanguage = yield* Atom.get(solutionsLanguageAtom);
    const theSecretWord = yield* Atom.get(wordChallengeTheSecretWordAtom);

    const { wordDefinition } = yield* RpcGameClient;
    return yield* wordDefinition({ solutionsLanguage, theSecretWord });
  })
);
