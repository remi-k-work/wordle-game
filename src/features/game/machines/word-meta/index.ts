// services, features, and other libraries
import { assertEvent } from "xstate";
import { setup } from "./setup";

// constants
import { INITIAL_WORD_META } from "./constants";

export const wordMetaMachine = setup.createMachine({
  id: "wordMeta",
  context: INITIAL_WORD_META(),
  initial: "awaitingTheSecretWord",

  on: {
    // Metadata cannot be loaded or reloaded until the game data machine has selected the next secret word
    secretWordPicked: { target: ".loading", reenter: true, context: () => INITIAL_WORD_META() },
    resetRequested: { target: ".awaitingTheSecretWord", context: () => INITIAL_WORD_META() },
  },

  states: {
    awaitingTheSecretWord: {},

    loading: {
      invoke: {
        src: "onLoadingActor",

        // The secret word is supplied by the event that triggered this load
        input: ({ event }) => {
          assertEvent(event, "secretWordPicked");
          return { theSecretWord: event.theSecretWord };
        },
        onDone: (args) => ({ target: "fetchingAudio", context: { ...args.context, ...args.output } }),

        // Metadata loading is non-critical; even if the actor itself fails unexpectedly, the game remains playable
        onError: { target: "ready" },
      },
    },

    fetchingAudio: {
      invoke: {
        src: "fetchAudioActor",
        input: ({ context }) => ({ theRiddle: context.theRiddle, wordDefinition: context.wordDefinition }),
        onDone: (args) => ({ target: "ready", context: { ...args.context, ...args.output } }),

        // Metadata loading is non-critical; even if the actor itself fails unexpectedly, the game remains playable
        onError: { target: "ready" },
      },
    },

    ready: {},
  },
});
