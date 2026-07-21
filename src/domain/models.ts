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
