// services, features, and other libraries
import { Effect, Option } from "effect";
import { Atom } from "effect/unstable/reactivity";
import { RuntimeClient } from "@/lib/runtime-client";
import { RpcGameClient } from "@/features/game/rpc/client";
import { assign, setup, fromPromise, assertEvent } from "xstate";
import { solutionsLanguageAtom } from "@/features/settings/state";

// types
import type { TheSecretWord, WordMeta } from "@/features/game/domain";

// constants
import { INITIAL_WORD_META } from "@/features/game/domain";

const onLoadingActor = fromPromise(async ({ input: { theSecretWord }, signal }: { input: { theSecretWord: TheSecretWord }; signal: AbortSignal }) =>
  RuntimeClient.runPromise(
    Effect.gen(function* () {
      yield* Effect.sleep("3 seconds");

      const solutionsLanguage = yield* Atom.get(solutionsLanguageAtom);

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
    events: { readonly type: "secretWordPicked"; readonly theSecretWord: TheSecretWord } | { readonly type: "retryRequested" };
    context: WordMeta;
  },
  actors: { onLoadingActor },
}).createMachine({
  id: "wordMeta",
  context: { ...INITIAL_WORD_META } as const satisfies WordMeta,
  initial: "awaitingTheSecretWord",

  states: {
    awaitingTheSecretWord: {
      on: {
        secretWordPicked: { target: "loading" },
      },
    },

    loading: {
      invoke: {
        src: "onLoadingActor",
        // Extract parameters directly from the incoming event that triggered this transition
        input: ({ event }) => {
          assertEvent(event, "secretWordPicked");
          return { theSecretWord: event.theSecretWord };
        },

        onDone: { target: "ready", actions: assign(({ context, event }) => ({ ...context, ...event.output }) as const satisfies WordMeta) },
        onError: { target: "failure" },
      },
    },

    ready: { on: { secretWordPicked: "loading" } },

    failure: { on: { retryRequested: "loading" } },
  },
});
