// services, features, and other libraries
import { Array, Effect, Option, Random } from "effect";
import { Atom } from "effect/reactivity";
import { runClientCommand } from "@/lib/runtime-client";
import { effectActor } from "@/lib/effect-actor";
import { RpcGameClient } from "@/features/game/rpc/client";
import { assign, setup } from "xstate";
import { gameSettingsSolutionsLanguageAtom } from "@/features/settings/state/game-settings";
import { wordChallengeMachineAtom } from "@/features/game/state/word-challenge";
import { wordMetaMachineAtom } from "@/features/game/state/word-meta";
import { overdriveHacksMachineAtom } from "@/features/overdrive-hacks/state/overdrive-hacks";

// types
import type { GameData, SolutionsLanguage, TheSecretWord } from "@/features/game/domain/models";

interface OnLoadingInput {
  solutionsLanguage?: SolutionsLanguage;
}

interface SelectSecretWordInput {
  solutions: Option.Option<ReadonlyArray<TheSecretWord>>;
}

// constants
import { INITIAL_GAME_DATA } from "@/features/game/domain/constants";

// Load the needed game data and create the dictionary of valid words
const onLoadingActor = effectActor(({ solutionsLanguage: requestedLanguage }: OnLoadingInput) =>
  Effect.gen(function* () {
    const solutionsLanguage = requestedLanguage ?? (yield* Atom.get(gameSettingsSolutionsLanguageAtom));

    const { fetchSolutions, fetchDictionary, fetchKeypad } = yield* RpcGameClient;
    const { solutions, dictionary, keypad } = yield* Effect.all(
      { solutions: fetchSolutions({ solutionsLanguage }), dictionary: fetchDictionary({ solutionsLanguage }), keypad: fetchKeypad({ solutionsLanguage }) },
      { concurrency: 3 }
    );

    return { solutions, dictionary, keypad } as const satisfies GameData;
  })
);

const selectSecretWordActor = effectActor(({ solutions }: SelectSecretWordInput) =>
  Effect.gen(function* () {
    // `Effect.fromOption` turns a missing or empty solutions list into a
    // controlled Effect failure (NoSuchElementError) that the machine handles
    // by transitioning to `failure` instead of crashing; `Random.shuffle` does
    // not throw on empty arrays; an empty list reaches `Array.head` which
    // returns `None`, and `Effect.fromOption` converts that to the failure
    const solutionsList = yield* Effect.fromOption(solutions);
    const shuffled = yield* Random.shuffle(solutionsList);
    return yield* Effect.fromOption(Array.head(shuffled));
  })
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
      runClientCommand(
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
    onGameDataLoaded: ({ context }) => runClientCommand(Atom.set(wordChallengeMachineAtom, { type: "gameDataLoaded", dictionary: context.dictionary })),
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
      invoke: {
        src: "selectSecretWordActor",
        input: ({ context }) => ({ solutions: context.solutions }),
        onDone: { target: "ready", actions: { type: "onSecretWordSelected", params: ({ event }) => ({ theSecretWord: event.output }) } },
        onError: "failure",
      },
    },

    failure: { on: { retryRequested: "loading" } },
  },
});
