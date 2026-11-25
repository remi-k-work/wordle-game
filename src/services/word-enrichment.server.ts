// services, features, and other libraries
import { Context, Effect, Layer, Option } from "effect";
import { OpenAiClient } from "@effect/ai-openai-compat/OpenAiClient";
import { OpenRouterClient } from "@effect/ai-openrouter/OpenRouterClient";
import { AiClientsWithHttp } from "@/domain/fallback-plan";
import { withAiFallback, AiSwitch, AiSwitchLayer } from "@/domain/helpers.server";
import { generateRiddle } from "@/features/game/domain/riddle";
import { generateOverride } from "@/features/overdrive-hacks/domain/override";

// types
import type { SolutionsLanguage, TheSecretWord } from "@/features/game/domain/models";
import type { WordChallenge } from "@/features/game/machines/word-challenge/models";
import type { WordMeta } from "@/features/game/machines/word-meta/models";

// The AI-backed enrichment surface; the service shape keeps the settle-to-`None`
// policy and the AI-off fallback strings in one place, so both RPC handlers are
// wiring only; kept private: consumers reach it structurally
interface WordEnrichmentShape {
  readonly riddle: (
    theSecretWord: TheSecretWord,
    solutionsLanguage: SolutionsLanguage,
    wordDefinition: WordMeta["wordDefinition"]
  ) => Effect.Effect<Option.Option<string>>;

  readonly override: (
    theSecretWord: TheSecretWord,
    wordDefinition: WordMeta["wordDefinition"],
    theRiddle: WordMeta["theRiddle"],
    wordleGuesses: WordChallenge["wordleGuesses"],
    solutionsLanguage: SolutionsLanguage
  ) => Effect.Effect<Option.Option<string>>;
}

export class WordEnrichment extends Context.Service<WordEnrichment, WordEnrichmentShape>()("WordEnrichment") {
  static readonly layer = Layer.effect(
    WordEnrichment,
    Effect.gen(function* () {
      // The generators apply `makeFallbackPlan` internally, whose step layers
      // need the provider clients in context; `ExecutionPlan` types those step
      // layers as `Layer.Any`, which hides the requirement (the generated
      // effect is typed `R = never`), so the dependencies are captured once
      // here and supplied per generation; this is what lets the handlers drop
      // their own `AiClientsWithHttp` provide while keeping one shared client per
      // runtime; the AI switch follows the same rule: `withAiEnabled` reads the
      // reference at call time, so the config-backed value read by the layer
      // has to be supplied to each generation too
      const openAiClient = yield* OpenAiClient;
      const openRouterClient = yield* OpenRouterClient;
      const aiSwitch = yield* AiSwitch;

      const provideDeps = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
        effect.pipe(
          Effect.provideService(OpenAiClient, openAiClient),
          Effect.provideService(OpenRouterClient, openRouterClient),
          Effect.provideService(AiSwitch, aiSwitch)
        );

      return WordEnrichment.of({
        riddle: (theSecretWord, solutionsLanguage, wordDefinition) =>
          provideDeps(
            withAiFallback(generateRiddle(theSecretWord, solutionsLanguage, wordDefinition), Effect.succeedSome("No riddle available in the AI off mode."))
          ),

        override: (theSecretWord, wordDefinition, theRiddle, wordleGuesses, solutionsLanguage) =>
          provideDeps(
            withAiFallback(
              generateOverride(theSecretWord, wordDefinition, theRiddle, wordleGuesses, solutionsLanguage),
              Effect.succeedSome("No override available in the AI off mode.")
            )
          ),
      });
    })
  ).pipe(Layer.provide(AiClientsWithHttp), Layer.provide(AiSwitchLayer));

  // Test-only: fixed enrichment values unless a fixture overrides a method, so
  // handler tests never touch the network, the AI provider layers, or API keys
  static readonly layerTest = (fixtures: Partial<WordEnrichmentShape> = {}) =>
    Layer.succeed(
      WordEnrichment,
      WordEnrichment.of({
        riddle: () => Effect.succeedSome("A test riddle."),
        override: () => Effect.succeedSome("A test override."),
        ...fixtures,
      })
    );
}
