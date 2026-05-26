// services, features, and other libraries
import { Schema } from "effect";

// Define a domain error for the database
export class DatabaseError extends Schema.TaggedError<DatabaseError>()("DatabaseError", {
  message: Schema.String,
  cause: Schema.optional(Schema.Defect),
}) {}

// Define a domain error for the ai sdk
export class AiSdkError extends Schema.TaggedError<AiSdkError>()("AiSdkError", {
  message: Schema.String,
  cause: Schema.optional(Schema.Defect),
}) {}
export class BetterAuthApiError extends Schema.TaggedError<BetterAuthApiError>()("BetterAuthApiError", {
  message: Schema.String,
  cause: Schema.optional(Schema.Defect),
}) {}
export class UtApiError extends Schema.TaggedError<UtApiError>()("UtApiError", {
  message: Schema.String,
  cause: Schema.optional(Schema.Defect),
}) {}

// Define a domain error for the unauthorized access
export class UnauthorizedAccessError extends Schema.TaggedError<UnauthorizedAccessError>()("UnauthorizedAccessError", {
  message: Schema.String,
  cause: Schema.optional(Schema.Defect),
}) {}

// Define a domain error for invalid page inputs and situations where an item is not found
export class InvalidPageInputsError extends Schema.TaggedError<InvalidPageInputsError>()("InvalidPageInputsError", {
  message: Schema.String,
  cause: Schema.optional(Schema.Defect),
}) {}
export class ItemNotFoundError extends Schema.TaggedError<ItemNotFoundError>()("ItemNotFoundError", {
  message: Schema.String,
  cause: Schema.optional(Schema.Defect),
}) {}

// Define a domain error for server validation, particularly for use during form validation
export class ValidationHasFailedError extends Schema.TaggedError<ValidationHasFailedError>()("ValidationHasFailedError", {
  message: Schema.String,
  cause: Schema.optional(Schema.Unknown),
}) {}
