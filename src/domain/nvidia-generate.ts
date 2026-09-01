// services, features, and other libraries
import { Effect, Schema } from "effect";
import { AiError, LanguageModel, Prompt } from "effect/unstable/ai";

// domain
import { AiProviderError } from "./errors";
import { makeNvidiaFallbackPlan } from "./nvidia-plan";

interface GenerateSingleFieldOptions {
  readonly temperature: number;
  readonly instructions: string;
  readonly prompt: string;
  readonly fieldName: string;
  readonly description: string;
}

// Raw single-field generation against whichever `LanguageModel` is in scope.
// Kept free of any ExecutionPlan so the caller decides the fallback ladder.
const attemptSingleField = Effect.fn("attemptSingleField")(function* (
  options: GenerateSingleFieldOptions
): Effect.fn.Return<string, AiError.AiError, LanguageModel.LanguageModel> {
  const model = yield* LanguageModel.LanguageModel;

  const fieldSchema = Schema.Struct({
    [options.fieldName]: Schema.String.pipe(Schema.annotate({ description: options.description })),
  });

  const prompt = Prompt.fromMessages([
    Prompt.systemMessage({ content: options.instructions }),
    Prompt.userMessage({ content: [Prompt.textPart({ text: options.prompt })] }),
  ]);

  const response = yield* model.generateObject({ prompt, schema: fieldSchema });

  const value = response.value as Record<string, string>;
  return value[options.fieldName] as string;
});

// Effect-AI native counterpart to `generateSingleField`: runs a single
// `LanguageModel.generateObject` call producing exactly one string field,
// validated through an Effect `Schema` (no Zod). Runs under the NVIDIA fallback
// ladder (built from the caller's sampling temperature) and maps any provider
// failure into a typed `AiProviderError`.
export const generateNvidiaSingleField = (options: GenerateSingleFieldOptions) =>
  attemptSingleField(options).pipe(Effect.withExecutionPlan(makeNvidiaFallbackPlan(options.temperature)), Effect.mapError(AiProviderError.fromAiError));

export type { GenerateSingleFieldOptions };
