// services, features, and other libraries
import { Effect, Option, Result, Schema } from "effect";
import { Atom } from "effect/reactivity";
import { createEffectLogic, setupEffect } from "@xstate/effect";
import { assertEvent } from "xstate";
import { RpcGameClient } from "@/features/game/rpc/client";
import { gameSettingsSolutionsLanguageAtom } from "@/features/settings/state/game-settings";
import { TheSecretWord, WordMeta } from "@/features/game/domain/models";

// types
import type { EffectSourceArgs } from "@xstate/effect";

interface OnLoadingInput {
  theSecretWord: TheSecretWord;
}

interface FetchAudioInput {
  theRiddle: WordMeta["theRiddle"];
  wordDefinition: WordMeta["wordDefinition"];
}

// constants
import { initialWordMeta } from "@/features/game/domain/constants";

const onLoadingActor = createEffectLogic(({ input: { theSecretWord } }: EffectSourceArgs<OnLoadingInput>) =>
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
  })
);

const fetchAudioActor = createEffectLogic(({ input: { theRiddle, wordDefinition } }: EffectSourceArgs<FetchAudioInput>) =>
  Effect.gen(function* () {
    const solutionsLanguage = yield* Atom.get(gameSettingsSolutionsLanguageAtom);

    // Both TTS fetches are independent (inputs already in context), so run them concurrently; we use "result" mode so a failure
    // in one request does not interrupt the other request. Each branch short-circuits to Option.none() when its text is missing
    const { fetchRiddleAudio, fetchWordDefinitionAudio } = yield* RpcGameClient;
    const { theRiddleAudioResult, wordDefinitionAudioResult } = yield* Effect.all(
      {
        theRiddleAudioResult: Option.match(theRiddle, {
          onNone: () => Effect.succeedNone,
          onSome: (riddle) => fetchRiddleAudio({ input: riddle, solutionsLanguage }),
        }),
        wordDefinitionAudioResult: Option.match(wordDefinition, {
          onNone: () => Effect.succeedNone,
          onSome: (definition) => fetchWordDefinitionAudio({ input: definition, solutionsLanguage }),
        }),
      },
      { mode: "result", concurrency: 2 }
    );

    const theRiddleAudio = Result.getOrElse(theRiddleAudioResult, Option.none);
    const wordDefinitionAudio = Result.getOrElse(wordDefinitionAudioResult, Option.none);

    return { theRiddleAudio, wordDefinitionAudio } as const satisfies Pick<WordMeta, "theRiddleAudio" | "wordDefinitionAudio">;
  })
);

export const wordMetaMachine = setupEffect({
  schemas: {
    context: WordMeta,
    events: {
      secretWordPicked: Schema.Struct({ theSecretWord: TheSecretWord }),
      resetRequested: Schema.Struct({}),
    },
  },
  actors: { onLoadingActor, fetchAudioActor },
}).createMachine({
  id: "wordMeta",
  context: initialWordMeta(),
  initial: "awaitingTheSecretWord",

  on: {
    // Metadata cannot be loaded or reloaded until the game data machine has selected the next secret word
    secretWordPicked: { target: ".loading", reenter: true, context: () => initialWordMeta() },
    resetRequested: { target: ".awaitingTheSecretWord", context: () => initialWordMeta() },
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
