// services, features, and other libraries
import { Effect, Schema } from "effect";
import { AiError, LanguageModel, Prompt } from "effect/unstable/ai";
import { AiProviderError, makeNvidiaFallbackPlan } from ".";

// types
interface GenerateSingleFieldOptions {
  readonly temperature: number;
  readonly instructions: string;
  readonly prompt: string;
  readonly fieldName: string;
  readonly description: string;
}

// Raw single-field generation against whichever `LanguageModel` is in scope
const attemptSingleField = Effect.fn("attemptSingleField")(function* ({ instructions, fieldName, description, ...options }: GenerateSingleFieldOptions) {
  const model = yield* LanguageModel.LanguageModel;

  const schema = Schema.Struct({ [fieldName]: Schema.Trim.pipe(Schema.annotate({ description })) });
  const prompt = Prompt.fromMessages([
    Prompt.systemMessage({ content: instructions }),
    Prompt.userMessage({ content: [Prompt.textPart({ text: options.prompt })] }),
  ]);

  // const response = yield* model.generateObject({ prompt, schema: fieldSchema }).pipe(Effect.timeout("12 seconds"));
  return yield* model.generateObject({ prompt, schema }).pipe(Effect.map(({ value }) => value[fieldName]));
});

// Effect-AI native counterpart to `generateSingleField`
export const generateNvidiaSingleField = (options: GenerateSingleFieldOptions) =>
  attemptSingleField(options).pipe(
    Effect.withExecutionPlan(makeNvidiaFallbackPlan({ temperature: options.temperature })),
    Effect.mapError((error) => {
      if (AiError.isAiError(error)) return AiProviderError.fromAiError(error);
      return new AiProviderError({ reason: new AiError.UnknownError({ description: String((error as Error)?.message ?? error) }) });
    })
  );
