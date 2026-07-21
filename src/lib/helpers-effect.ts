/* eslint-disable @typescript-eslint/no-explicit-any */

// next
import { connection } from "next/server";
import { notFound, unauthorized } from "next/navigation";

// services, features, and other libraries
import { Effect, Result, Schema } from "effect";
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

  // Standardized error handling
  if (Result.isFailure(pageMainResult)) {
    const error = pageMainResult.failure;

    if (error._tag === "InvalidPageInputsError") notFound();
    if (error._tag === "ItemNotFoundError") notFound();
    if (error._tag === "UnauthorizedAccessError") unauthorized();
    if (error._tag === "BetterAuthApiError") unauthorized();

    // Allow the next.js error boundary to catch any unexpected errors
    throw error;
  } else {
    // Return success result
    return pageMainResult.success;
  }
};

// Execute the main effect for the component, handle known errors, and return the payload
export const runComponentMain = async <A, E extends { _tag: string }>(componentMain: Effect.Effect<A, E, any>) => {
  // Explicitly defer to request time (Effect uses Date.now() internally)
  await connection();

  // We wrap in Effect.result to catch failures gracefully
  const componentMainResult = await RuntimeServer.runPromise(
    componentMain.pipe(
      Effect.tapError((error) => Effect.log(`[COMPONENT MAIN ERROR]: ${error}`)),
      Effect.result
    )
  );

  // Standardized error handling
  if (Result.isFailure(componentMainResult)) {
    const error = componentMainResult.failure;

    // Allow the next.js error boundary to catch any unexpected errors
    throw error;
  } else {
    // Return success result
    return componentMainResult.success;
  }
};
