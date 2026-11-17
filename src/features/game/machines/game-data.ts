// services, features, and other libraries
import { Effect, Random, Schema } from "effect";
import { Atom, AtomRegistry } from "effect/reactivity";
import { createEffectLogic, setupEffect } from "@xstate/effect";
import { RpcGameClient } from "@/features/game/rpc/client";
import { gameSettingsSolutionsLanguageAtom } from "@/features/settings/state/game-settings";
import { wordChallengeMachineSendAtom } from "@/features/game/state/word-challenge";
import { wordMetaMachineSendAtom } from "@/features/game/state/word-meta";
import { overdriveHacksMachineSendAtom } from "@/features/overdrive-hacks/state/overdrive-hacks";
import { GameData, SolutionsLanguage, TheSecretWord } from "@/features/game/domain/models";

// types
import type { EffectSourceArgs } from "@xstate/effect";

interface OnLoadingInput {
  solutionsLanguage?: SolutionsLanguage;
}

interface SelectSecretWordInput {
  solutions: GameData["solutions"];
}

// constants
import { initialGameData } from "@/features/game/domain/constants";

// Load the needed game data and create the dictionary of valid words
const onLoadingActor = createEffectLogic(({ input: { solutionsLanguage: requestedLanguage } }: EffectSourceArgs<OnLoadingInput>) =>
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

const selectSecretWordActor = createEffectLogic(({ input: { solutions } }: EffectSourceArgs<SelectSecretWordInput>) =>
  Effect.flatMap(Effect.fromOption(solutions), Random.choice)
);

export const gameDataMachine = setupEffect({
  schemas: {
    context: GameData,
    events: {
      solutionsLanguageChanged: Schema.Struct({ solutionsLanguage: SolutionsLanguage }),
      nextWordRequested: Schema.Struct({}),
      retryRequested: Schema.Struct({}),
    },
    actions: {
      onSecretWordSelected: { params: Schema.Struct({ theSecretWord: TheSecretWord }) },
      onGameDataLoaded: { params: Schema.Struct({ dictionary: Schema.Option(Schema.HashSet(TheSecretWord)) }) },
    },
  },
  actors: { onLoadingActor, selectSecretWordActor },
  actions: {
    onSecretWordSelected: ({ theSecretWord }): Effect.Effect<void, never, AtomRegistry.AtomRegistry> =>
      Effect.all(
        [
          // *** TEST CODE ***
          // *** TEST CODE ***
          // *** TEST CODE ***
          Effect.log(`The Secret Word: ${theSecretWord}`),
          // *** TEST CODE ***
          // *** TEST CODE ***
          // *** TEST CODE ***

          Atom.set(wordMetaMachineSendAtom, { type: "secretWordPicked", theSecretWord }),
          Atom.set(wordChallengeMachineSendAtom, { type: "secretWordPicked", theSecretWord }),
          Atom.set(overdriveHacksMachineSendAtom, { type: "puzzle.started" }),
        ],
        { discard: true }
      ),

    // Notify the word challenge machine that game data is ready (no word yet — idle state)
    onGameDataLoaded: ({ dictionary }) => Atom.set(wordChallengeMachineSendAtom, { type: "gameDataLoaded", dictionary }),
  },
}).createMachine({
  id: "gameData",
  context: initialGameData(),
  initial: "loading",

  on: { solutionsLanguageChanged: { target: ".loading", reenter: true } },

  states: {
    loading: {
      invoke: {
        src: "onLoadingActor",

        // The solutions language is supplied by the event that triggered this load
        input: ({ event }) => (event.type === "solutionsLanguageChanged" ? { solutionsLanguage: event.solutionsLanguage } : {}),
        onDone: (args, enq) => {
          enq(args.actions.onGameDataLoaded, { self: args.self, dictionary: args.output.dictionary });
          return { target: "ready", context: { ...args.context, ...args.output } };
        },
        onError: { target: "failure" },
      },
    },

    ready: { on: { nextWordRequested: { target: "selectingWord" } } },

    selectingWord: {
      invoke: {
        src: "selectSecretWordActor",
        input: ({ context }) => ({ solutions: context.solutions }),
        onDone: (args, enq) => {
          enq(args.actions.onSecretWordSelected, { self: args.self, theSecretWord: args.output });
          return { target: "ready" };
        },
        onError: { target: "failure" },
      },
    },

    failure: { on: { retryRequested: { target: "loading" } } },
  },
});
