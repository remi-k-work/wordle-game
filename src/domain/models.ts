// services, features, and other libraries
import { Effect, Schema } from "effect";

// Page inputs (params and searchParams)
const PageParams = Schema.Record(Schema.Trim, Schema.Trim);
const PageSearchParams = Schema.Record(
  Schema.Trim,
  Schema.Union([Schema.Trim, Schema.Array(Schema.Trim), Schema.Finite, Schema.Array(Schema.Finite), Schema.Undefined])
);

// Represents the base page in next.js
export class BasePage extends Schema.Class<BasePage>("BasePage")({
  params: PageParams.pipe(Schema.withDecodingDefault(Effect.succeed({}))),
  searchParams: PageSearchParams.pipe(Schema.withDecodingDefault(Effect.succeed({}))),
}) {}

export class SpeechRequest extends Schema.Class<SpeechRequest>("SpeechRequest")({
  model: Schema.optionalKey(
    Schema.Trim.pipe(
      Schema.withDecodingDefaultType(Effect.succeed("fish-audio/s2.1-pro-free:free")),
      Schema.withConstructorDefault(Effect.succeed("fish-audio/s2.1-pro-free:free"))
    )
  ),
  input: Schema.Trim.pipe(Schema.check(Schema.isNonEmpty())),
  voice: Schema.optionalKey(Schema.Trim.pipe(Schema.check(Schema.isNonEmpty()))),
  response_format: Schema.optionalKey(Schema.Literal("mp3").pipe(Schema.withDecodingDefaultType(Effect.succeed("mp3")))),
}) {}
