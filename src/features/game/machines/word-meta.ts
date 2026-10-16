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

interface FetchAudioActorArgs {
  input: { theRiddle: WordMeta["theRiddle"]; wordDefinition: WordMeta["wordDefinition"] };
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

const fetchAudioActor = fromPromise(({ input: { theRiddle, wordDefinition }, signal }: FetchAudioActorArgs) =>
  RuntimeClient.runPromise(
    Effect.gen(function* () {
      const solutionsLanguage = yield* Atom.get(gameSettingsSolutionsLanguageAtom);

      // Both TTS fetches are independent (inputs already in context), so run them
      // concurrently; we use "result" mode so a failure in one request does not
      // interrupt the other request. Each branch short-circuits to Option.none()
      // when its text is missing
      const { fetchRiddleAudio, fetchWordDefinitionAudio } = yield* RpcGameClient;
      const { theRiddleAudioResult, wordDefinitionAudioResult } = yield* Effect.all(
        {
          theRiddleAudioResult: Option.isNone(theRiddle) ? Effect.succeedNone : fetchRiddleAudio({ input: theRiddle.value, solutionsLanguage }),
          wordDefinitionAudioResult: Option.isNone(wordDefinition)
            ? Effect.succeedNone
            : fetchWordDefinitionAudio({ input: wordDefinition.value, solutionsLanguage }),
        },
        { mode: "result", concurrency: 2 }
      );

      const theRiddleAudio = Result.getOrElse(theRiddleAudioResult, Option.none);
      const wordDefinitionAudio = Result.getOrElse(wordDefinitionAudioResult, Option.none);

      return { theRiddleAudio, wordDefinitionAudio } as const satisfies Pick<WordMeta, "theRiddleAudio" | "wordDefinitionAudio">;
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

    saveAudio: assign(
      ({ context }, params: { audio: Pick<WordMeta, "theRiddleAudio" | "wordDefinitionAudio"> }) =>
        ({ ...context, ...params.audio }) as const satisfies WordMeta
    ),

    clearWordMeta: assign(() => INITIAL_WORD_META),
  },
  actors: { onLoadingActor, fetchAudioActor },
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
        onDone: { target: "fetchingAudio", actions: { type: "saveWordMeta", params: ({ event }) => ({ wordMeta: event.output }) } },

        // Metadata loading is non-critical; even if the actor itself fails unexpectedly, the game remains playable
        onError: "ready",
      },
    },

    fetchingAudio: {
      invoke: {
        src: "fetchAudioActor",

        input: ({ context }) => ({ theRiddle: context.theRiddle, wordDefinition: context.wordDefinition }),
        onDone: { target: "ready", actions: { type: "saveAudio", params: ({ event }) => ({ audio: event.output }) } },

        // Metadata loading is non-critical; even if the actor itself fails unexpectedly, the game remains playable
        onError: "ready",
      },
    },

    ready: {},
  },
});
