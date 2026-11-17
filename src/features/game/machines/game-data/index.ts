// services, features, and other libraries
import { setup } from "./setup";

// constants
import { INITIAL_GAME_DATA } from "./constants";

export const gameDataMachine = setup.createMachine({
  id: "gameData",
  context: INITIAL_GAME_DATA(),
  initial: "loading",

  on: { solutionsLanguageChanged: { target: ".loading", reenter: true } },

  states: {
    loading: {
      invoke: {
        src: "onLoadingActor",

        // The solutions language is supplied by the event that triggered this load
        input: ({ event }) => (event.type === "solutionsLanguageChanged" ? { requestedLanguage: event.solutionsLanguage } : {}),
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
