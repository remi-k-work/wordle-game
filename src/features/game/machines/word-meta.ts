// oxlint-disable typescript/no-misused-spread

// services, features, and other libraries
import { Effect, Option, Result } from "effect";
import { Atom } from "effect/unstable/reactivity";
import { RuntimeClient } from "@/lib/runtime-client";
import { RpcGameClient } from "@/features/game/rpc/client";
import { assign, setup, fromPromise, assertEvent } from "xstate";
import { gameSettingsSolutionsLanguageAtom } from "@/features/settings/state";

// types
import type { TheSecretWord, WordMeta } from "@/features/game/domain";

interface OnLoadingActorArgs {
  input: { theSecretWord: TheSecretWord };
  signal: AbortSignal;
}

interface FetchRiddleAudioActorArgs {
  input: { theRiddle: WordMeta["theRiddle"] };
  signal: AbortSignal;
}

interface FetchWordDefinitionAudioActorArgs {
  input: { wordDefinition: WordMeta["wordDefinition"] };
  signal: AbortSignal;
}

// constants
import { INITIAL_WORD_META } from "@/features/game/domain";

const onLoadingActor = fromPromise(({ input: { theSecretWord }, signal }: OnLoadingActorArgs) =>
  RuntimeClient.runPromise(
    Effect.gen(function* () {
      const solutionsLanguage = yield* Atom.get(gameSettingsSolutionsLanguageAtom);

      // Load both pieces of metadata independently; we use "result" mode so a failure in one request does not interrupt the other request
      const { fetchRiddle, fetchDefinition } = yield* RpcGameClient;
      const { theRiddleResult, wordDefinitionResult } = yield* Effect.all(
        { theRiddleResult: fetchRiddle({ theSecretWord, solutionsLanguage }), wordDefinitionResult: fetchDefinition({ solutionsLanguage, theSecretWord }) },
        { mode: "result", concurrency: 2 }
      );

      const theRiddle = Result.getOrElse(theRiddleResult, Option.none);
      const wordDefinition = Result.getOrElse(wordDefinitionResult, Option.none);

      // Riddles and definitions are optional enrichments; failed requests are converted into Option.none() instead of failing the entire actor
      return { theRiddle, wordDefinition } as const satisfies Omit<WordMeta, "theRiddleAudio" | "wordDefinitionAudio">;
    }),
    { signal }
  )
);

const fetchRiddleAudioActor = fromPromise(({ input: { theRiddle }, signal }: FetchRiddleAudioActorArgs) =>
  RuntimeClient.runPromise(
    Effect.gen(function* () {
      const solutionsLanguage = yield* Atom.get(gameSettingsSolutionsLanguageAtom);

      const { fetchRiddleAudio } = yield* RpcGameClient;
      if (Option.isNone(theRiddle)) return Option.none();
      return yield* fetchRiddleAudio({ input: theRiddle.value, solutionsLanguage });
    }),
    { signal }
  )
);

const fetchWordDefinitionAudioActor = fromPromise(({ input: { wordDefinition }, signal }: FetchWordDefinitionAudioActorArgs) =>
  RuntimeClient.runPromise(
    Effect.gen(function* () {
      const solutionsLanguage = yield* Atom.get(gameSettingsSolutionsLanguageAtom);

      const { fetchWordDefinitionAudio } = yield* RpcGameClient;
      if (Option.isNone(wordDefinition)) return Option.none();
      return yield* fetchWordDefinitionAudio({ input: wordDefinition.value, solutionsLanguage });
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
    saveWordMeta: assign(
      ({ context }, params: { wordMeta: Omit<WordMeta, "theRiddleAudio" | "wordDefinitionAudio"> }) =>
        ({ ...context, ...params.wordMeta }) as const satisfies WordMeta
    ),

    saveRiddleAudio: assign(
      ({ context }, params: { theRiddleAudio: WordMeta["theRiddleAudio"] }) =>
        ({ ...context, theRiddleAudio: params.theRiddleAudio }) as const satisfies WordMeta
    ),

    saveWordDefinitionAudio: assign(
      ({ context }, params: { wordDefinitionAudio: WordMeta["wordDefinitionAudio"] }) =>
        ({ ...context, wordDefinitionAudio: params.wordDefinitionAudio }) as const satisfies WordMeta
    ),

    clearWordMeta: assign(() => INITIAL_WORD_META),
  },
  actors: { onLoadingActor, fetchRiddleAudioActor, fetchWordDefinitionAudioActor },
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
        onDone: { target: "fetchingRiddleAudio", actions: { type: "saveWordMeta", params: ({ event }) => ({ wordMeta: event.output }) } },

        // Metadata loading is non-critical; even if the actor itself fails unexpectedly, the game remains playable
        onError: "ready",
      },
    },

    fetchingRiddleAudio: {
      invoke: {
        src: "fetchRiddleAudioActor",

        input: ({ context }) => ({ theRiddle: context.theRiddle }),
        onDone: { target: "fetchingWordDefinitionAudio", actions: { type: "saveRiddleAudio", params: ({ event }) => ({ theRiddleAudio: event.output }) } },

        // Metadata loading is non-critical; even if the actor itself fails unexpectedly, the game remains playable
        onError: "ready",
      },
    },

    fetchingWordDefinitionAudio: {
      invoke: {
        src: "fetchWordDefinitionAudioActor",

        input: ({ context }) => ({ wordDefinition: context.wordDefinition }),
        onDone: { target: "ready", actions: { type: "saveWordDefinitionAudio", params: ({ event }) => ({ wordDefinitionAudio: event.output }) } },

        // Metadata loading is non-critical; even if the actor itself fails unexpectedly, the game remains playable
        onError: "ready",
      },
    },

    ready: {},
  },
});
