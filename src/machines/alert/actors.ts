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
    // `await` inside an async thunk funnels both a sync throw and a rejection into the error channel
    try: async () => {
      await input();
    },
    catch: (cause) => new AlertOkayedError({ cause }),
  })
);
