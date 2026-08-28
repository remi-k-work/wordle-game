// services, features, and other libraries
import { Schema } from "effect";

// Define a domain error for the ai sdk
export class AiSdkError extends Schema.TaggedError<AiSdkError>()("AiSdkError", {
  message: Schema.String,
  cause: Schema.optionalKey(Schema.Defect()),
}) {}

// Define a domain error for invalid page inputs
export class InvalidPageInputsError extends Schema.TaggedError<InvalidPageInputsError>()("InvalidPageInputsError", {
  message: Schema.String,
  cause: Schema.optionalKey(Schema.Defect()),
}) {}
