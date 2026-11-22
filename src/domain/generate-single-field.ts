// services, features, and other libraries
import { Cause, Effect, Option, Predicate, Schema, String } from "effect";
import { AiError, LanguageModel, Model, Prompt } from "effect/ai";
import { AiProviderError } from "./errors";
import { makeFallbackPlan } from "./fallback-plan";
import { formatTextForTTS } from "./formatters";
import { isRealFailure } from "./helpers";

// types
interface GenerateSingleFieldOptions {
  readonly instructions: string;
  readonly userPrompt: string;
  readonly fieldName: string;
  readonly description: string;
}

// Surfaces a message from an unknown failure without assuming an Error shape
const describeFailure = (error: unknown) =>
  Predicate.hasProperty(error, "message") && Predicate.isString(error.message) ? error.message : String.String(error);

// Type guard (same pattern as `Schema.is(OpenRouterError)` in open-router.server.ts)
const isAiProviderError = Schema.is(AiProviderError);

// Raw single-field generation against whichever `LanguageModel` is in scope
export const generateSingleField = Effect.fn("generateSingleField")(
  function* ({ instructions, userPrompt, fieldName, description }: GenerateSingleFieldOptions) {
    const languageModel = yield* LanguageModel.LanguageModel;
    const modelName = yield* Model.ModelName;

    const schema = Schema.Struct({ [fieldName]: Schema.Trim.pipe(Schema.annotate({ description })) });
    const prompt = Prompt.fromMessages([
      Prompt.systemMessage({ content: instructions }),
      Prompt.userMessage({ content: [Prompt.textPart({ text: userPrompt })] }),
    ]);

    return yield* languageModel.generateObject({ prompt, schema }).pipe(
      // Normalize for TTS and keep only non-empty output (an empty riddle is no riddle)
      // Check non-empty on the raw value first so formatTextForTTS only runs on real content
      Effect.map(({ value }) => (String.isNonEmpty(value[fieldName]) ? Option.some(formatTextForTTS(value[fieldName])) : Option.none())),
      Effect.tapCauseIf(isRealFailure, (cause) =>
        Effect.logError(`The attempt to generate output using the "${modelName}" model was unsuccessful. ${Cause.pretty(cause)}`)
      )
    );
  },
  Effect.withExecutionPlan(makeFallbackPlan),
  // AiError carries `_tag: "AiError"`, so catchTag handles it directly. Since
  // TaggedError instances are yieldable, the catchTag handler's AiProviderError
  // becomes a failure — the mapError guard below must not re-wrap it (that
  // would replace the structured `reason` with an UnknownError). Any other
  // remaining typed failure was already logged above, so surface its message
  // (when present) wrapped in an UnknownError reason
  Effect.catchTag("AiError", (error) => AiProviderError.fromAiError(error)),
  Effect.mapError((error) =>
    isAiProviderError(error) ? error : new AiProviderError({ reason: new AiError.UnknownError({ description: describeFailure(error) }) })
  )
);
