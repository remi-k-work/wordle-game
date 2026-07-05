// services, features, and other libraries
import { Effect, HashSet, Option, Random } from "effect";
import { Atom } from "effect/unstable/reactivity";
import { RuntimeClient } from "@/lib/runtime-client";
import { RpcGameClient } from "@/features/game/rpc/client";
import { assign, setup, fromPromise, assertEvent } from "xstate";
import { wordChallengeMachineAtom } from "@/features/game/state";

// types
import type { GameData, SolutionsLanguage } from "@/features/game/domain";

// constants
import { INITIAL_GAME_DATA } from "@/features/game/domain";

// Load the needed game data, create the dictionary of valid words, and pick a new random secret word
const loadGameDataActor = fromPromise(
  async ({ input: { solutionsLanguage }, signal }: { input: { solutionsLanguage: SolutionsLanguage }; signal: AbortSignal }) =>
    RuntimeClient.runPromise(
      Effect.gen(function* () {
        yield* Effect.sleep("1 seconds");

        const { fetchSolutions, fetchDictionary, fetchKeypad } = yield* RpcGameClient;
        const { solutions, dictionary, keypad } = yield* Effect.all(
          { solutions: fetchSolutions({ solutionsLanguage }), dictionary: fetchDictionary({ solutionsLanguage }), keypad: fetchKeypad({ solutionsLanguage }) },
          { concurrency: 3 }
        );

        // Pick a new random secret word
        const randomIndex = yield* Random.nextIntBetween(0, solutions.length);
        const theSecretWord = solutions[randomIndex].toUpperCase();

        // *** TEST CODE ***
        // *** TEST CODE ***
        // *** TEST CODE ***
        yield* Effect.log(`Secret word: ${theSecretWord}`);
        // *** TEST CODE ***
        // *** TEST CODE ***
        // *** TEST CODE ***

        return {
          solutions: Option.some(solutions),

          // This is the more forgiving dictionary of valid words we can enter (no lemmas only) (HashSet for O(1) lookups)
          dictionary: Option.some(HashSet.fromIterable(dictionary.map((word) => word.toUpperCase()))),
          keypad: Option.some(keypad),
          theSecretWord: Option.some(theSecretWord),
        } as const;
      }),
      { signal }
    )
);

// Notify the word challenge machine that the game data has been loaded
const onDataLoadedActor = fromPromise(async ({ input: { context }, signal }: { input: { context: GameData }; signal: AbortSignal }) =>
  RuntimeClient.runPromise(
    Atom.set(wordChallengeMachineAtom, {
      type: "gameDataLoaded",
      solutions: context.solutions,
      dictionary: context.dictionary,
      theSecretWord: Option.getOrThrow(context.theSecretWord),
    }),
    {
      signal,
    }
  )
);

export const gameDataMachine = setup({
  types: {} as {
    events: { readonly type: "loadRequested"; readonly solutionsLanguage: SolutionsLanguage } | { readonly type: "retryRequested" };
    context: GameData;
  },
  actions: {
    saveSolutionsLanguage: assign({
      solutionsLanguage: ({ event }) => {
        assertEvent(event, "loadRequested");
        return Option.some(event.solutionsLanguage);
      },
    }),
  },
  actors: { loadGameDataActor, onDataLoadedActor },
}).createMachine({
  id: "gameData",
  context: { ...INITIAL_GAME_DATA } as const satisfies GameData,
  initial: "idle",

  states: {
    idle: {
      on: { loadRequested: { target: "loading", actions: "saveSolutionsLanguage" } },
    },

    loading: {
      invoke: {
        src: "loadGameDataActor",
        input: ({ context }) => ({ solutionsLanguage: Option.getOrThrow(context.solutionsLanguage) }),

        onDone: {
          target: "ready",
          actions: assign(({ context, event }) => ({ ...context, ...event.output }) as const satisfies GameData),
        },

        onError: {
          target: "failure",
        },
      },
    },

    ready: {
      invoke: {
        src: "onDataLoadedActor",
        input: ({ context }) => ({ context }),
      },

      on: { loadRequested: { target: "loading", actions: "saveSolutionsLanguage" } },
    },

    failure: {
      on: { retryRequested: "loading" },
    },
  },
});
