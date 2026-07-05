// services, features, and other libraries
import { Effect, Option } from "effect";
import { RuntimeClient } from "@/lib/runtime-client";
import { RpcGameClient } from "@/features/game/rpc/client";
import { assign, setup, fromPromise, assertEvent } from "xstate";

// types
import type { SolutionsLanguage, TheSecretWord, WordMeta } from "@/features/game/domain";

// constants
import { INITIAL_WORD_META } from "@/features/game/domain";

const loadMetaActor = fromPromise(
  async ({
    input: { solutionsLanguage, theSecretWord },
    signal,
  }: {
    input: { solutionsLanguage: SolutionsLanguage; theSecretWord: TheSecretWord };
    signal: AbortSignal;
  }) =>
    RuntimeClient.runPromise(
      Effect.gen(function* () {
        yield* Effect.sleep("3 seconds");

        const { fetchRiddle, fetchDefinition } = yield* RpcGameClient;
        const { theRiddle, wordDefinition } = yield* Effect.all(
          { theRiddle: fetchRiddle({ theSecretWord, solutionsLanguage }), wordDefinition: fetchDefinition({ solutionsLanguage, theSecretWord }) },
          { concurrency: 2 }
        );

        return { theRiddle: Option.some(theRiddle), wordDefinition: Option.some(wordDefinition) } as const satisfies WordMeta;
      }),
      { signal }
    )
);

export const wordMetaMachine = setup({
  types: {} as {
    events:
      | { readonly type: "loadRequested"; readonly theSecretWord: TheSecretWord; readonly solutionsLanguage: SolutionsLanguage }
      | { readonly type: "retryRequested" };
    context: WordMeta;
  },
  actors: { loadMetaActor },
}).createMachine({
  id: "wordMeta",
  context: { ...INITIAL_WORD_META } as const satisfies WordMeta,
  initial: "idle",

  states: {
    idle: {
      on: {
        loadRequested: { target: "loading" },
      },
    },

    loading: {
      invoke: {
        src: "loadMetaActor",
        // Extract parameters directly from the incoming event that triggered this transition
        input: ({ event }) => {
          assertEvent(event, "loadRequested");
          return { theSecretWord: event.theSecretWord, solutionsLanguage: event.solutionsLanguage };
        },

        onDone: {
          target: "ready",
          actions: assign(({ context, event }) => ({ ...context, ...event.output }) as const satisfies WordMeta),
        },

        onError: {
          target: "failure",
        },
      },
    },

    ready: {
      on: { loadRequested: "loading" },
    },

    failure: {
      on: { retryRequested: "loading" },
    },
  },
});
