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
      // A load that never settles times out into `failure` rather than stranding
      // the machine; the timer is cancelled whenever the state exits normally
      timeout: "gameDataTimeout",
      onTimeout: { target: "failure", input: { operation: "loading" } },

      invoke: {
        src: "onLoadingActor",

        // The solutions language is supplied by the event that triggered this load
        input: ({ event }) => (event.type === "solutionsLanguageChanged" ? { requestedLanguage: event.solutionsLanguage } : {}),
        onDone: (args, enq) => {
          enq(args.actions.onGameDataLoaded, { self: args.self, dictionary: args.output.dictionary });
          return { target: "ready", context: { ...args.context, ...args.output } };
        },
        onError: (args, enq) => {
          enq(args.actions.onGameDataFailed, { self: args.self, operation: "loading", error: args.event.error });
          return { target: "failure", input: { operation: "loading" } };
        },
      },
    },

    ready: { on: { nextWordRequested: { target: "selectingWord" } } },

    selectingWord: {
      timeout: "gameDataTimeout",
      onTimeout: { target: "failure", input: { operation: "selectingWord" } },

      invoke: {
        src: "selectSecretWordActor",
        input: ({ context }) => ({ solutions: context.solutions }),
        onDone: (args, enq) => {
          enq(args.actions.onSecretWordSelected, { self: args.self, theSecretWord: args.output });
          return { target: "ready" };
        },
        onError: (args, enq) => {
          enq(args.actions.onGameDataFailed, { self: args.self, operation: "selectingWord", error: args.event.error });
          return { target: "failure", input: { operation: "selectingWord" } };
        },
      },
    },

    failure: {
      on: {
        // Re-enter the operation that failed; `input` is the failure state's own
        // state input; `reenter: true` restarts that state's timeout and invoke
        retryRequested: ({ input }) => ({ target: input.operation, reenter: true }),
      },
    },
  },
});
