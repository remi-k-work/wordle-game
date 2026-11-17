// services, features, and other libraries
import { Schema } from "effect";

// A confirm callback that rejects is modeled as a typed error rather than an
// anonymous defect, so the machine can log it deliberately instead of letting
// the actor die with it
export class AlertOkayedError extends Schema.TaggedError<AlertOkayedError, { readonly brand: unique symbol }>()("AlertOkayedError", {
  cause: Schema.Defect(),
}) {}
