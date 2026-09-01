/* eslint-disable @typescript-eslint/no-explicit-any */

// next
import { connection } from "next/server";
import { notFound, unauthorized } from "next/navigation";

// services, features, and other libraries
import { Effect, Match, Result, Schema, pipe } from "effect";
import { RuntimeServer } from "./runtime-server";
import { InvalidPageInputsError } from "@/domain";

// types
interface PageInputPromises {
  params: Promise<Record<string, string>>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// Safely validate next.js route inputs (`params` and `searchParams`) against a schema; return typed data or trigger a 404 on failure
export const validatePageInputs = <A>(schema: Schema.Schema<A>, { params, searchParams }: PageInputPromises) =>
  Effect.gen(function* () {
    const [p, sp] = yield* Effect.all([Effect.promise(() => params), Effect.promise(() => searchParams)], { concurrency: 2 });
    return yield* Schema.decodeUnknownEffect(schema)({ params: p, searchParams: sp }).pipe(
      Effect.mapError((cause) => new InvalidPageInputsError({ message: "Invalid page inputs", cause }))
    );
  });

// Execute the main effect for the page, map known errors to the subsequent navigation helpers, and return the payload
export const runPageMainOrNavigate = async <A, E extends { _tag: string }>(pageMain: Effect.Effect<A, E, any>) => {
  // Explicitly defer to request time (Effect uses Date.now() internally)
  await connection();

  // We wrap in Effect.result to catch failures gracefully
  const pageMainResult = await RuntimeServer.runPromise(
    pageMain.pipe(
      Effect.tapError((error) => Effect.log(`[PAGE MAIN ERROR]: ${error}`)),
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
