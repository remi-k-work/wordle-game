// services, features, and other libraries
import { Schema } from "effect";
import { AiError } from "effect/unstable/ai";

// Define a domain error for the ai sdk
export class AiSdkError extends Schema.TaggedError<AiSdkError>()("AiSdkError", {
  message: Schema.String,
  cause: Schema.optionalKey(Schema.Defect()),
}) {}

// Define a domain error for the Effect-based AI providers (the migration target
// for dropping the AI SDK). It wraps Effect's `AiError.AiErrorReason` so callers
// can still introspect provider-level failures without depending on the AI SDK.
export class AiProviderError extends Schema.TaggedError<AiProviderError>()("AiProviderError", {
  reason: AiError.AiErrorReason,
}) {
  static fromAiError(error: AiError.AiError) {
    return new AiProviderError({ reason: error.reason });
  }
}

// Define a domain error for invalid page inputs
export class InvalidPageInputsError extends Schema.TaggedError<InvalidPageInputsError>()("InvalidPageInputsError", {
  message: Schema.String,
  cause: Schema.optionalKey(Schema.Defect()),
}) {}
