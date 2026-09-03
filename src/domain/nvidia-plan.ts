// services, features, and other libraries
import { Config, Effect, ExecutionPlan, Layer, Schedule } from "effect";
import { OpenAiClient, OpenAiLanguageModel } from "@effect/ai-openai-compat";

// constants
const NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1";

// Builds a single fallback step for the specified model
const step = (model: string, config: typeof OpenAiLanguageModel.Config.Service) => ({
  provide: OpenAiLanguageModel.model(model, config),
  attempts: 2,
  schedule: Schedule.exponential("1 second", 2),
});

// Builds the NVIDIA fallback ladder for the Effect `LanguageModel` service
export const makeNvidiaFallbackPlan = (config: typeof OpenAiLanguageModel.Config.Service) =>
  ExecutionPlan.make(
    // step("openai/gpt-oss-20b", { temperature: 1, top_p: 1, max_tokens: 1024, stream: false }, 1)
    step("nvidia/nemotron-3-ultra-550b-a55b", config)
  );

// The NVIDIA client layer, backed by the OpenAI-compatible endpoint
export const makeNvidiaClientLayer = () =>
  Layer.unwrap(
    Config.redacted("NVIDIA_API_KEY").pipe(
      Effect.map((apiKey) => Layer.effect(OpenAiClient.OpenAiClient, OpenAiClient.make({ apiUrl: NVIDIA_BASE_URL, apiKey })))
    )
  );
