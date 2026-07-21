// services, features, and other libraries
import { Schema } from "effect";

// Define a domain error for the database
export class DatabaseError extends Schema.TaggedErrorClass<DatabaseError>()("DatabaseError", {
  message: Schema.String,
  cause: Schema.optionalKey(Schema.Defect()),
}) {}

// Define a domain error for the ai sdk
export class AiSdkError extends Schema.TaggedErrorClass<AiSdkError>()("AiSdkError", {
  message: Schema.String,
  cause: Schema.optionalKey(Schema.Defect()),
}) {}
export class BetterAuthApiError extends Schema.TaggedErrorClass<BetterAuthApiError>()("BetterAuthApiError", {
  message: Schema.String,
  cause: Schema.optionalKey(Schema.Defect()),
}) {}
export class UtApiError extends Schema.TaggedErrorClass<UtApiError>()("UtApiError", {
  message: Schema.String,
  cause: Schema.optionalKey(Schema.Defect()),
}) {}

// Define a domain error for the unauthorized access
export class UnauthorizedAccessError extends Schema.TaggedErrorClass<UnauthorizedAccessError>()("UnauthorizedAccessError", {
  message: Schema.String,
  cause: Schema.optionalKey(Schema.Defect()),
}) {}

// Define a domain error for invalid page inputs and situations where an item is not found
export class InvalidPageInputsError extends Schema.TaggedErrorClass<InvalidPageInputsError>()("InvalidPageInputsError", {
  message: Schema.String,
  cause: Schema.optionalKey(Schema.Defect()),
}) {}
export class ItemNotFoundError extends Schema.TaggedErrorClass<ItemNotFoundError>()("ItemNotFoundError", {
  message: Schema.String,
  cause: Schema.optionalKey(Schema.Defect()),
}) {}

// Define a domain error for server validation, particularly for use during form validation
export class ValidationHasFailedError extends Schema.TaggedErrorClass<ValidationHasFailedError>()("ValidationHasFailedError", {
  message: Schema.String,
  cause: Schema.optionalKey(Schema.Unknown),
}) {}
