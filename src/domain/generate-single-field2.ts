// services, features, and other libraries
import { Cause, Effect, Option, Predicate, Schema, String } from "effect";
import { AiError, LanguageModel, Model, Prompt } from "effect/ai";
import { AiProviderError } from "./errors";
import { makeFallbackPlan2 } from "./fallback-plan2";
import { formatTextForTTS } from "./formatters";

// types
interface GenerateSingleFieldOptions {
  readonly instructions: string;
  readonly prompt: string;
  readonly fieldName: string;
  readonly description: string;
}

// Surfaces a message from an unknown failure without assuming an Error shape
const describeFailure = (cause: unknown) =>
  Predicate.hasProperty(cause, "message") && Predicate.isString(cause.message) ? cause.message : String.String(cause);

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
      // Normalize for TTS and keep only non-empty output (an empty riddle is no riddle)
      Effect.map(({ value }) => Option.liftPredicate(formatTextForTTS(value[fieldName]), String.isNonEmpty)),
      Effect.tapCause((cause) => Effect.logError(`The attempt to generate output using the "${modelName}" model was unsuccessful. ${Cause.pretty(cause)}`))
    );
  },
  Effect.withExecutionPlan(makeFallbackPlan2),
  Effect.mapError((error) => {
    if (AiError.isAiError(error)) return AiProviderError.fromAiError(error);
    // The full fidelity of any non-AI failure was already logged above; surface
    // its message (when present) in the normalized error
    return new AiProviderError({ reason: new AiError.UnknownError({ description: describeFailure(error) }) });
  })
);
