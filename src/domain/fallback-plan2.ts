// services, features, and other libraries
import { Config, Effect, ExecutionPlan, Layer, Schedule } from "effect";
import { FetchHttpClient } from "effect/http";
import { OpenAiClient, OpenAiLanguageModel } from "@effect/ai-openai-compat";
import { OpenRouterClient, OpenRouterLanguageModel } from "@effect/ai-openrouter";

// Builds one fallback step: the provider to try, bounded attempts, and a shared
// retry policy; both provider clients go through this so the ladder cannot end
// up retrying Cloudflare and OpenRouter differently
const aiStep = <A>(provide: A) => ({ provide, attempts: 2, schedule: Schedule.exponential("1 second", 2) });

// Builds the shared fallback ladder for any LanguageModel service; Cloudflare is always tried first because it runs closest to the Worker
// Gemma is the quality-first primary with thinking disabled to avoid multi-minute reasoning turns
// Llama and GPT-OSS are the remaining Cloudflare fallbacks; OpenRouter is strictly secondary
export const makeFallbackPlan2 = ExecutionPlan.make(
  aiStep(OpenAiLanguageModel.model("@cf/google/gemma-4-26b-a4b-it", { strictJsonSchema: true, chat_template_kwargs: { enable_thinking: false } })),
  aiStep(OpenAiLanguageModel.model("@cf/meta/llama-3.3-70b-instruct-fp8-fast", { strictJsonSchema: true })),
  aiStep(OpenAiLanguageModel.model("@cf/openai/gpt-oss-120b", { strictJsonSchema: true, reasoning_effort: "low" })),
  aiStep(OpenRouterLanguageModel.model("google/gemma-4-26b-a4b-it", { strictJsonSchema: true, reasoning_effort: "none" })),
  aiStep(OpenRouterLanguageModel.model("google/gemma-4-31b-it", { strictJsonSchema: true, reasoning_effort: "none" })),
  aiStep(OpenRouterLanguageModel.model("openrouter/free", { strictJsonSchema: true, reasoning_effort: "low" }))
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
