// services, features, and other libraries
import { Effect } from "effect";
import { createEffectLogic } from "@xstate/effect";
import { AlertOkayedError } from "./errors";

// types
import type { EffectSourceArgs } from "@xstate/effect";
import type { OkayedCallback } from "./models";

// Waits for the (possibly promise-returning) confirm callback to settle
export const runOkayedActor = createEffectLogic(({ input }: EffectSourceArgs<OkayedCallback>) =>
  Effect.tryPromise({
    // `Promise.resolve` normalizes the `void | Promise<void>` union, and `tryPromise`
    // itself maps a synchronous throw from the thunk (as well as a rejection) into
    // the error channel — no `async` wrapper needed
    try: () => Promise.resolve(input()),
    catch: (cause) => new AlertOkayedError({ cause }),
  })
);
