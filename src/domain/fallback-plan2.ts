// services, features, and other libraries
import { Config, Effect, ExecutionPlan, Layer, Schedule } from "effect";
import { OpenRouterClient, OpenRouterLanguageModel } from "@effect/ai-openrouter";

// Builds a single fallback step for the specified model
const step = (model: string, config: typeof OpenRouterLanguageModel.Config.Service) => ({
  provide: OpenRouterLanguageModel.model(model, config),
  attempts: 2,
  schedule: Schedule.exponential("1 second", 2),
});

// Builds the shared fallback ladder for any LanguageModel service
export const makeFallbackPlan2 = ExecutionPlan.make(
  step("openrouter/auto", { strictJsonSchema: true, reasoning_effort: "none" }),
  step("google/gemma-4-26b-a4b-it", { strictJsonSchema: true, reasoning_effort: "none" }),
  step("google/gemma-4-31b-it", { strictJsonSchema: true, reasoning_effort: "none" }),
  step("openrouter/free", { strictJsonSchema: true, reasoning_effort: "none" })
);

// The OpenRouter client layer, backed by the OpenAI-compatible endpoint
export const OpenRouterClientLayer = Layer.unwrap(
  Config.redacted("OPENROUTER_API_KEY").pipe(Effect.map((apiKey) => Layer.effect(OpenRouterClient.OpenRouterClient, OpenRouterClient.make({ apiKey }))))
);
