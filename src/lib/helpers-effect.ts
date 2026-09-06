// oxlint-disable effecttsgo/async-function

// next
import { connection } from "next/server";
import { notFound, unauthorized } from "next/navigation";

// services, features, and other libraries
import { Effect, Match, Result, Schema, pipe } from "effect";
import { RuntimeServer } from "./runtime-server";
import { BasePage, InvalidPageInputsError } from "@/domain";

// types
import type { ServerMainServices } from "./runtime-server";

interface PageInputPromises {
  params: Promise<Record<string, string>>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// The encoded shape every page schema must accept: Next.js route inputs as
// modeled by the domain (`BasePage`). Threading it through the generic keeps
// the schema's `Type`, `Encoded`, and `DecodingServices` precise instead of
// widening to `Schema.Top` (whose `DecodingServices` is `unknown`).
type PageInputsEncoded = (typeof BasePage)["Encoded"];

// Safely validate next.js route inputs (`params` and `searchParams`) against a schema; return typed data or trigger a 404 on failure
export const validatePageInputs = <A, S extends Schema.Constraint & { readonly Type: A; readonly Encoded: PageInputsEncoded }>(
  schema: S,
  { params, searchParams }: PageInputPromises
) =>
  Effect.gen(function* () {
    const [p, sp] = yield* Effect.all([Effect.promise(() => params), Effect.promise(() => searchParams)], { concurrency: 2 });
    return yield* Schema.decodeEffect(schema)({ params: p, searchParams: sp }).pipe(
      Effect.mapError((cause) => new InvalidPageInputsError({ message: "Invalid page inputs", cause }))
    );
  });

// Execute the main effect for the page, map known errors to the subsequent navigation helpers, and return the payload
// NOTE: intentionally `async` — this bridges Effect into the async Server Component
// contract (`await connection()`, `RuntimeServer.runPromise`, and the throwing
// `notFound()`/`unauthorized()` navigation helpers). Representing it as an
// `Effect.gen` would only move the `await` into the caller.
export const runPageMainOrNavigate = async <A, E extends { _tag: string }>(pageMain: Effect.Effect<A, E, ServerMainServices>) => {
  // Explicitly defer to request time (Effect uses Date.now() internally)
  await connection();

  // We wrap in Effect.result to catch failures gracefully
  const pageMainResult = await RuntimeServer.runPromise(
    pageMain.pipe(
      Effect.tapError((error) => Effect.log("[PAGE MAIN ERROR]:", error)),
      Effect.result
    )
  );

  // Standardized error handling: dispatch known error tags to the matching
  // navigation helpers, and re-throw anything unexpected for the error boundary.
  // The onFailure branch never returns — known errors `notFound()`/`unauthorized()`,
  // unknown errors re-throw for the error boundary.
  return Result.match(pageMainResult, {
    onFailure: (error): never =>
      pipe(
        Match.value(error._tag),
        Match.whenOr("InvalidPageInputsError", "ItemNotFoundError", () => notFound()),
        Match.whenOr("UnauthorizedAccessError", "BetterAuthApiError", () => unauthorized()),
        Match.orElse(() => {
          throw error;
        })
      ),
    onSuccess: (result) => result,
  });
};
