// services, features, and other libraries
import { Array, Config, Effect, ExecutionPlan, Layer, Schedule } from "effect";
import { FetchHttpClient } from "effect/http";
import { OpenAiClient, OpenAiLanguageModel } from "@effect/ai-openai-compat";
import { OpenRouterClient, OpenRouterLanguageModel } from "@effect/ai-openrouter";

// The fallback ladder, as data: one rung per (model id, provider-specific config) pair, in attempt order
export const CLOUDFLARE_AI_MODELS = [
  { id: "@cf/google/gemma-4-26b-a4b-it", config: { strictJsonSchema: true, chat_template_kwargs: { enable_thinking: false } } },
  { id: "@cf/meta/llama-3.3-70b-instruct-fp8-fast", config: { strictJsonSchema: true } },
  { id: "@cf/openai/gpt-oss-120b", config: { strictJsonSchema: true, reasoning_effort: "low" } },
] as const;

export const OPENROUTER_AI_MODELS = [
  { id: "google/gemma-4-26b-a4b-it", config: { strictJsonSchema: true, reasoning_effort: "none" } },
  { id: "google/gemma-4-31b-it", config: { strictJsonSchema: true, reasoning_effort: "none" } },
  { id: "openrouter/free", config: { strictJsonSchema: true, reasoning_effort: "low" } },
] as const;

// Builds one fallback step: the provider to try, bounded attempts, and a shared retry policy
const aiStep = <A>(provide: A) => ({ provide, attempts: 2, schedule: Schedule.exponential("1 second", 2) });

// Builds the shared fallback ladder for any LanguageModel service from the rung tables above
export const makeFallbackPlan = ExecutionPlan.make(
  ...Array.map(CLOUDFLARE_AI_MODELS, ({ id, config }) => aiStep(OpenAiLanguageModel.model(id, config))),
  ...Array.map(OPENROUTER_AI_MODELS, ({ id, config }) => aiStep(OpenRouterLanguageModel.model(id, config)))
);

// The OpenRouter client layer, backed by the OpenAI-compatible endpoint
const OpenRouterClientLayer = Layer.unwrap(
  Effect.gen(function* () {
    const apiKey = yield* Config.Redacted("OPENROUTER_API_KEY");
    return Layer.effect(OpenRouterClient.OpenRouterClient, OpenRouterClient.make({ apiKey }));
  })
).pipe(Layer.provide(FetchHttpClient.layer));

// Cloudflare Workers AI client, backed by its OpenAI-compatible endpoint; the compat client appends /chat/completions to this base URL
export const CloudflareClientLayer = Layer.unwrap(
  Effect.gen(function* () {
    const apiKey = yield* Config.Redacted("CLOUDFLARE_WORKERS_AI_API_TOKEN");
    const accountId = yield* Config.String("CLOUDFLARE_ACCOUNT_ID");

    return OpenAiClient.layer({ apiKey, apiUrl: `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/v1` });
  })
).pipe(Layer.provide(FetchHttpClient.layer));

// Both provider clients are required because the fallback ladder mixes them
export const AiClientsWithHttp = Layer.mergeAll(OpenRouterClientLayer, CloudflareClientLayer);
