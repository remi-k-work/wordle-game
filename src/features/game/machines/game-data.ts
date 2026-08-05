// services, features, and other libraries
import { Effect, HashSet, Option, Random } from "effect";
import { Atom } from "effect/unstable/reactivity";
import { RuntimeClient } from "@/lib/runtime-client";
import { RpcGameClient } from "@/features/game/rpc/client";
import { assign, setup, fromPromise } from "xstate";
import { gameSettingsSolutionsLanguageAtom } from "@/features/settings/state";
import { wordChallengeMachineAtom, wordMetaMachineAtom } from "@/features/game/state";
import { overdriveHacksMachineAtom } from "@/features/overdrive-hacks/state";

// types
import type { GameData, SolutionsLanguage, TheSecretWord } from "@/features/game/domain";

// constants
import { INITIAL_GAME_DATA } from "@/features/game/domain";

// Load the needed game data and create the dictionary of valid words
const onLoadingActor = fromPromise(async ({ input, signal }: { input: { solutionsLanguage?: SolutionsLanguage }; signal: AbortSignal }) =>
  RuntimeClient.runPromise(
    Effect.gen(function* () {
      const solutionsLanguage = input.solutionsLanguage ?? (yield* Atom.get(gameSettingsSolutionsLanguageAtom));

      const { fetchSolutions, fetchDictionary, fetchKeypad } = yield* RpcGameClient;
      const { solutions, dictionary, keypad } = yield* Effect.all(
        { solutions: fetchSolutions({ solutionsLanguage }), dictionary: fetchDictionary({ solutionsLanguage }), keypad: fetchKeypad({ solutionsLanguage }) },
        { concurrency: 3 }
      );

      return {
        solutions: Option.some(solutions),

        // This is the more forgiving dictionary of valid words we can enter (no lemmas only) (HashSet for O(1) lookups)
        dictionary: Option.some(HashSet.fromIterable(dictionary.map((word) => word.toUpperCase()))),

        keypad: Option.some(keypad),
      } as const satisfies GameData;
    }),
    { signal }
  )
);

const selectSecretWordActor = fromPromise(async ({ input, signal }: { input: { solutions: ReadonlyArray<string> }; signal: AbortSignal }) =>
  RuntimeClient.runPromise(
    Effect.gen(function* () {
      const randomIndex = yield* Random.nextIntBetween(0, input.solutions.length);
      return input.solutions[randomIndex].toUpperCase();
    }),
    { signal }
  )
);

export const gameDataMachine = setup({
  types: {} as {
    events:
      | { readonly type: "solutionsLanguageChanged"; readonly solutionsLanguage: SolutionsLanguage }
      | { readonly type: "nextWordRequested" }
      | { readonly type: "retryRequested" };
    context: GameData;
  },
  actions: {
    // Save the loaded game data
    saveGameData: assign(({ context }, params: { gameData: GameData }) => ({ ...context, ...params.gameData }) as const satisfies GameData),

    onSecretWordSelected: (_, params: { theSecretWord: TheSecretWord }) =>
      RuntimeClient.runPromise(
        Effect.gen(function* () {
          const theSecretWord = params.theSecretWord;

          // *** TEST CODE ***
          // *** TEST CODE ***
          // *** TEST CODE ***
          yield* Effect.log(`The Secret Word: ${theSecretWord}`);
          // *** TEST CODE ***
          // *** TEST CODE ***
          // *** TEST CODE ***

          yield* Atom.set(wordMetaMachineAtom, { type: "secretWordPicked", theSecretWord });
          yield* Atom.set(wordChallengeMachineAtom, { type: "secretWordPicked", theSecretWord });
          yield* Atom.set(overdriveHacksMachineAtom, { type: "puzzle.started" });
        })
      ),

    // Notify the word challenge machine that game data is ready (no word yet — idle state)
    onGameDataLoaded: ({ context }) => RuntimeClient.runPromise(Atom.set(wordChallengeMachineAtom, { type: "gameDataLoaded", dictionary: context.dictionary })),
  },
  actors: { onLoadingActor, selectSecretWordActor },
}).createMachine({
  id: "gameData",
  context: INITIAL_GAME_DATA,
  initial: "loading",

  on: { solutionsLanguageChanged: { target: ".loading", reenter: true } },

  states: {
    loading: {
      invoke: {
        src: "onLoadingActor",

        // The solutions language is supplied by the event that triggered this load
        input: ({ event }) => (event.type === "solutionsLanguageChanged" ? { solutionsLanguage: event.solutionsLanguage } : {}),
        onDone: { target: "ready", actions: [{ type: "saveGameData", params: ({ event }) => ({ gameData: event.output }) }, "onGameDataLoaded"] },
        onError: "failure",
      },
    },

    ready: { on: { nextWordRequested: { target: "selectingWord" } } },

    selectingWord: {
      tags: ["loading"],
      invoke: {
        src: "selectSecretWordActor",
        input: ({ context }) => ({ solutions: Option.getOrThrow(context.solutions) }),
        onDone: { target: "ready", actions: { type: "onSecretWordSelected", params: ({ event }) => ({ theSecretWord: event.output }) } },
        onError: "failure",
      },
    },

    failure: { on: { retryRequested: "loading" } },
  },
});
