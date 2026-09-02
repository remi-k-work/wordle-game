// services, features, and other libraries
import { Config, Effect, ExecutionPlan, Layer, Schedule } from "effect";
import { OpenAiClient, OpenAiLanguageModel } from "@effect/ai-openai-compat";

// constants
const NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1";

// `OpenAiLanguageModel.model` accepts a non-exported `ModelConfig` (an open
// record). Mirror its shape here so callers can pass NVIDIA sampling config
// (temperature/top_p/max_tokens/chat_template_kwargs) type-safely.
type ModelConfig = {
  readonly temperature?: number | null;
  readonly top_p?: number | null;
  readonly max_tokens?: number | null;
  readonly [x: string]: unknown;
};

// NVIDIA NIM (OpenAI-compatible) models verified on the free dev key via the
// Effect-v4 quality matrices. `enable_thinking: false` is required to stay
// inside Vercel's `maxDuration=60` — thinking:true adds 500-900 hidden tokens
// and pushes TTFT to 20-45s, causing 504 gateway timeouts on non-streaming
// `LanguageModel.generateObject`. Tuned max_tokens: 256 (riddle) / 512 (clue)
// keeps outputs TTS-friendly and fast (1-4s when routed).
const SHARED_CONFIG_BASE: ModelConfig = {
  top_p: 0.95,
  chat_template_kwargs: { enable_thinking: false },
};

const step = (model: string, config: ModelConfig, attempts: number) => ({
  provide: OpenAiLanguageModel.model(model, config),
  attempts,
  schedule: Schedule.exponential("300 millis", 2),
});

// Builds the NVIDIA fallback ladder for the Effect `LanguageModel` service.
// This is the Effect-AI native counterpart to `makeGeminiFallbackPlan` via
// `Effect.withExecutionPlan`. Ladder is super-120B (primary, faster + best
// Polish) → ultra-550B (fallback). `temperature` and `maxTokens` are
// caller-supplied because riddle (creative 0.9 / 256) and override clue
// (precise 0.5 / 512) intentionally sample differently. `attempts:1` + tight
// schedule avoids burning the 60s Vercel budget before the next step.
export const makeNvidiaFallbackPlan = (options: { temperature: number; maxTokens: number }) =>
  ExecutionPlan.make(
    step("nvidia/nemotron-3-super-120b-a12b", { ...SHARED_CONFIG_BASE, temperature: options.temperature, max_tokens: options.maxTokens }, 1),
    step("nvidia/nemotron-3-ultra-550b-a55b", { ...SHARED_CONFIG_BASE, temperature: options.temperature, max_tokens: options.maxTokens }, 1)
  );

// The NVIDIA client layer, backed by the OpenAI-compatible endpoint. Callers must
// still supply an HttpClient (NodeHttpClient.layerUndici in server code). Mirrors
// the construction that proved out during the experimentation sweep.
export const makeNvidiaClientLayer = () =>
  Layer.unwrap(
    Config.redacted("NVIDIA_API_KEY").pipe(
      Effect.map((apiKey) =>
        Layer.effect(
          OpenAiClient.OpenAiClient,
          OpenAiClient.make({
            apiUrl: NVIDIA_BASE_URL,
            apiKey,
          })
        )
      )
    )
  );
