// services, features, and other libraries
import { Effect, Schema } from "effect";
import { AiError, LanguageModel, Model, Prompt } from "effect/unstable/ai";
import { AiProviderError, makeFallbackPlan2 } from ".";

// types
interface GenerateSingleFieldOptions {
  readonly instructions: string;
  readonly prompt: string;
  readonly fieldName: string;
  readonly description: string;
}

// Raw single-field generation against whichever `LanguageModel` is in scope
export const generateSingleField2 = Effect.fn("generateSingleField2")(
  function* ({ instructions, fieldName, description, ...options }: GenerateSingleFieldOptions) {
    const languageModel = yield* LanguageModel.LanguageModel;
    const modelName = yield* Model.ModelName;

    const schema = Schema.Struct({ [fieldName]: Schema.Trim.pipe(Schema.annotate({ description })) });
    const prompt = Prompt.fromMessages([
      Prompt.systemMessage({ content: instructions }),
      Prompt.userMessage({ content: [Prompt.textPart({ text: options.prompt })] }),
    ]);

    return yield* languageModel.generateObject({ prompt, schema }).pipe(
      Effect.map(({ value }) => value[fieldName]),
      Effect.tapError(() => Effect.logError(`The attempt to generate output using the "${modelName}" model was unsuccessful.`))
    );
  },
  Effect.withExecutionPlan(makeFallbackPlan2),
  Effect.mapError((error) => {
    if (AiError.isAiError(error)) return AiProviderError.fromAiError(error);
    return new AiProviderError({ reason: new AiError.UnknownError({ description: String((error as Error)?.message ?? error) }) });
  })
);
