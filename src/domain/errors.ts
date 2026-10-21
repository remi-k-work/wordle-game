// services, features, and other libraries
import { Schema } from "effect";
import { AiError } from "effect/ai";

// Define a domain error for the Effect-based AI providers
export class AiProviderError extends Schema.TaggedError<AiProviderError>()("AiProviderError", {
  reason: AiError.AiErrorReason,
}) {
  static fromAiError(error: AiError.AiError) {
    return new AiProviderError({ reason: error.reason });
  }
}

export class OpenRouterError extends Schema.TaggedError<OpenRouterError>()("OpenRouterError", {
  cause: Schema.Defect(),
  status: Schema.optionalKey(Schema.Int),
  responseBody: Schema.optionalKey(Schema.String),
}) {}
