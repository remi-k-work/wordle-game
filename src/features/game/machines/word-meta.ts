// services, features, and other libraries
import { Effect, Option, Result } from "effect";
import { Atom } from "effect/unstable/reactivity";
import { RuntimeClient } from "@/lib/runtime-client";
import { RpcGameClient } from "@/features/game/rpc/client";
import { assign, setup, fromPromise, assertEvent } from "xstate";
import { gameSettingsSolutionsLanguageAtom } from "@/features/settings/state";

// types
import type { TheSecretWord, WordMeta } from "@/features/game/domain";

// constants
import { INITIAL_WORD_META } from "@/features/game/domain";

const onLoadingActor = fromPromise(({ input: { theSecretWord }, signal }: { input: { theSecretWord: TheSecretWord }; signal: AbortSignal }) =>
  RuntimeClient.runPromise(
    Effect.gen(function* () {
      const solutionsLanguage = yield* Atom.get(gameSettingsSolutionsLanguageAtom);

      // Load both pieces of metadata independently; we use "result" mode so a failure in one request does not interrupt the other request
      const { fetchRiddle, fetchDefinition } = yield* RpcGameClient;
      const { theRiddle, wordDefinition } = yield* Effect.all(
        { theRiddle: fetchRiddle({ theSecretWord, solutionsLanguage }), wordDefinition: fetchDefinition({ solutionsLanguage, theSecretWord }) },
        { mode: "result", concurrency: 2 }
      );

      // Riddles and definitions are optional enrichments; failed requests are converted into Option.none() instead of failing the entire actor
      return {
        theRiddle: Result.match(theRiddle, { onFailure: Option.none, onSuccess: Option.some }),
        wordDefinition: Result.match(wordDefinition, { onFailure: Option.none, onSuccess: (definition) => definition }),
      } as const satisfies WordMeta;
    }),
    { signal }
  )
);

export const wordMetaMachine = setup({
  types: {} as {
    events: { readonly type: "secretWordPicked"; readonly theSecretWord: TheSecretWord } | { readonly type: "resetRequested" };
    context: WordMeta;
  },
  actions: {
    // Save the loaded word meta
    saveWordMeta: assign(({ context }, params: { wordMeta: WordMeta }) => ({ ...context, ...params.wordMeta }) as const satisfies WordMeta),
    clearWordMeta: assign(() => INITIAL_WORD_META),
  },
  actors: { onLoadingActor },
}).createMachine({
  id: "wordMeta",
  context: INITIAL_WORD_META,
  initial: "awaitingTheSecretWord",

  on: {
    // Metadata cannot be loaded or reloaded until the game data machine has selected the next secret word
    secretWordPicked: { target: ".loading", reenter: true, actions: "clearWordMeta" },
    resetRequested: { target: ".awaitingTheSecretWord", actions: "clearWordMeta" },
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

        onDone: { target: "ready", actions: { type: "saveWordMeta", params: ({ event }) => ({ wordMeta: event.output }) } },

        // Metadata loading is non-critical; even if the actor itself fails unexpectedly, the game remains playable
        onError: "ready",
      },
    },

    ready: {},
  },
});
