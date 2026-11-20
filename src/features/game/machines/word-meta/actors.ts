// services, features, and other libraries
import { Effect, Option, Result } from "effect";
import { Atom } from "effect/reactivity";
import { createEffectLogic } from "@xstate/effect";
import { RpcGameClient } from "@/features/game/rpc/client";
import { gameSettingsSolutionsLanguageAtom } from "@/features/settings/state/game-settings";

// types
import type { EffectSourceArgs } from "@xstate/effect";
import type { TheSecretWord } from "@/features/game/domain/models";
import type { WordMeta } from "./models";

interface OnLoadingInput {
  theSecretWord: TheSecretWord;
}

interface FetchAudioInput {
  theRiddle: WordMeta["theRiddle"];
  wordDefinition: WordMeta["wordDefinition"];
}

export const onLoadingActor = createEffectLogic(
  Effect.fnUntraced(function* ({ input: { theSecretWord } }: EffectSourceArgs<OnLoadingInput>) {
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

export const fetchAudioActor = createEffectLogic(
  Effect.fnUntraced(function* ({ input: { theRiddle, wordDefinition } }: EffectSourceArgs<FetchAudioInput>) {
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
