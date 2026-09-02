// services, features, and other libraries
import { Effect, Schema } from "effect";
import { AiError, LanguageModel, Prompt } from "effect/unstable/ai";
import { AiProviderError, makeNvidiaFallbackPlan } from ".";

interface GenerateSingleFieldOptions {
  readonly temperature: number;
  readonly instructions: string;
  readonly prompt: string;
  readonly fieldName: string;
  readonly description: string;
}

// Raw single-field generation against whichever `LanguageModel` is in scope.
// Kept free of any ExecutionPlan so the caller decides the fallback ladder.
// Each `generateObject` is bounded to 12s so a slow/ thinking model fails fast
// and the fallback ladder can try the next model before Vercel's 60s gateway
// timeout — otherwise non-streaming 20-45s TTFT leaves the gateway idle → 504.
const attemptSingleField = Effect.fn("attemptSingleField")(function* (
  options: GenerateSingleFieldOptions
): Effect.fn.Return<string, AiError.AiError | unknown, LanguageModel.LanguageModel> {
  const model = yield* LanguageModel.LanguageModel;

  const fieldSchema = Schema.Struct({
    [options.fieldName]: Schema.String.pipe(Schema.annotate({ description: options.description })),
  });

  const prompt = Prompt.fromMessages([
    Prompt.systemMessage({ content: options.instructions }),
    Prompt.userMessage({ content: [Prompt.textPart({ text: options.prompt })] }),
  ]);

  const response = yield* model.generateObject({ prompt, schema: fieldSchema }).pipe(Effect.timeout("12 seconds"));

  const value = response.value as Record<string, string>;
  return value[options.fieldName] as string;
});

// Effect-AI native counterpart to `generateSingleField`: runs a single
// `LanguageModel.generateObject` call producing exactly one string field,
// validated through an Effect `Schema` (no Zod). Runs under the NVIDIA fallback
// ladder (built from the caller's sampling temperature + tuned maxTokens) and
// maps any provider failure (including 12s timeout) into a typed `AiProviderError`.
export const generateNvidiaSingleField = (options: GenerateSingleFieldOptions) => {
  const maxTokens = options.fieldName === "riddle" ? 256 : 512;
  return attemptSingleField(options).pipe(
    Effect.withExecutionPlan(makeNvidiaFallbackPlan({ temperature: options.temperature, maxTokens })),
    Effect.mapError((error) => {
      if (AiError.isAiError(error)) {
        return AiProviderError.fromAiError(error);
      }
      return new AiProviderError({
        reason: new AiError.UnknownError({ description: String((error as Error)?.message ?? error) }),
      });
    })
  );
};

export type { GenerateSingleFieldOptions };
