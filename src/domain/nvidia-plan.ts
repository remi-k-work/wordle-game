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

// NVIDIA NIM (OpenAI-compatible) models verified working on the free dev key
// during the Effect-v4 experimentation sweep. The nemotron models use NVIDIA's
// reasoning `chat_template_kwargs`; the OpenAI reasoning model does not.
const SHARED_CONFIG: ModelConfig = {
  top_p: 0.95,
  max_tokens: 1024,
  chat_template_kwargs: { enable_thinking: true },
};

const step = (model: string, config: ModelConfig, attempts: number) => ({
  provide: OpenAiLanguageModel.model(model, config),
  attempts,
  schedule: Schedule.exponential("1 second", 2),
});

// Builds the NVIDIA fallback ladder (fastest primary → heaviest last resort) for
// the Effect `LanguageModel` service. This is the Effect-AI native counterpart to
// `makeGeminiFallbackPlan`, exercising `Effect.withExecutionPlan` instead of the
// AI SDK's provider list, and is the target shape for the full migration away
// from the AI SDK + Zod.
//
// `temperature` is caller-supplied because the riddle (creative, high) and the
// override clue (precise, lower) intentionally sample differently. Everything
// else is a shared, verified NVIDIA NIM default.
export const makeNvidiaFallbackPlan = (temperature: number) =>
  ExecutionPlan.make(
    step("nvidia/nemotron-3-ultra-550b-a55b", { ...SHARED_CONFIG, temperature }, 2),
    step("nvidia/nemotron-3-super-120b-a12b", { ...SHARED_CONFIG, temperature }, 2),
    step("openai/gpt-oss-120b", { temperature, top_p: 1, max_tokens: 1024 }, 2)
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
