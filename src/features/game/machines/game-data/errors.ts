// services, features, and other libraries
import { Schema } from "effect";

// A solutions list that is `None` or empty cannot yield a secret word; a typed
// error (not a bare NoSuchElementError) lets the machine's onError branch log a
// diagnosable failure — same pattern as HackInputUnavailableError
export class EmptySolutionsError extends Schema.TaggedError<EmptySolutionsError, { readonly brand: unique symbol }>()("EmptySolutionsError", {
  reason: Schema.Literals(["missing", "empty"]),
}) {}
