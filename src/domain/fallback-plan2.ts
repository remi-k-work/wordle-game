// services, features, and other libraries
import { Config, Effect, ExecutionPlan, Layer, Schedule } from "effect";
import { FetchHttpClient } from "effect/http";
import { OpenAiClient, OpenAiLanguageModel } from "@effect/ai-openai-compat";
import { OpenRouterClient, OpenRouterLanguageModel } from "@effect/ai-openrouter";

// Builds a single OpenRouter fallback step for the specified model
const openRouterStep = (model: string, config: typeof OpenRouterLanguageModel.Config.Service) => ({
  provide: OpenRouterLanguageModel.model(model, config),
  attempts: 2,
  schedule: Schedule.exponential("1 second", 2),
});

// Builds a single Cloudflare fallback step for the specified model
const cloudflareStep = (model: string, config: typeof OpenAiLanguageModel.Config.Service) => ({
  provide: OpenAiLanguageModel.model(model, config),
  attempts: 2,
  schedule: Schedule.exponential("1 second", 2),
});

// Builds the shared fallback ladder for any LanguageModel service
// Cloudflare runs closest to the Worker and is tried first
// OpenRouter remains the final safety net for quality and availability
export const makeFallbackPlan2 = ExecutionPlan.make(
  cloudflareStep("@cf/openai/gpt-oss-120b", { strictJsonSchema: true, reasoning_effort: "low" }),
  cloudflareStep("@cf/meta/llama-3.3-70b-instruct-fp8-fast", { strictJsonSchema: true }),
  openRouterStep("google/gemma-4-26b-a4b-it", { strictJsonSchema: true, reasoning_effort: "none" }),
  openRouterStep("google/gemma-4-31b-it", { strictJsonSchema: true, reasoning_effort: "none" }),
  openRouterStep("openrouter/free", { strictJsonSchema: true, reasoning_effort: "low" })
);

// The OpenRouter client layer, backed by the OpenAI-compatible endpoint
const OpenRouterClientLayer = Layer.unwrap(
  Config.Redacted("OPENROUTER_API_KEY").pipe(Effect.map((apiKey) => Layer.effect(OpenRouterClient.OpenRouterClient, OpenRouterClient.make({ apiKey }))))
).pipe(Layer.provide(FetchHttpClient.layer));

// Cloudflare Workers AI client, backed by its OpenAI-compatible endpoint; the compat client appends /chat/completions to this base URL
export const CloudflareClientLayer = Layer.unwrap(
  Effect.gen(function* () {
    const apiKey = yield* Config.Redacted("CLOUDFLARE_API_TOKEN");
    const accountId = yield* Config.String("CLOUDFLARE_ACCOUNT_ID");

    return OpenAiClient.layer({ apiKey, apiUrl: `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/v1` });
  })
).pipe(Layer.provide(FetchHttpClient.layer));

// Both provider clients are required because the fallback ladder mixes them
export const AiClientsWithHttp = Layer.mergeAll(OpenRouterClientLayer, CloudflareClientLayer);
