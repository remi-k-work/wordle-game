// services, features, and other libraries
import { Schema } from "effect";

// A hack actor that cannot read its inputs fails with this instead of a bare
// NoSuchElementError: the machine's onError branch logs it as a diagnosable
// failure rather than an anonymous defect
export class HackInputUnavailableError extends Schema.TaggedError<HackInputUnavailableError, { readonly brand: unique symbol }>()("HackInputUnavailableError", {
  input: Schema.Literals(["theSecretWord", "keypad"]),
}) {}
