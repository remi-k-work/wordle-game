// services, features, and other libraries
import { Effect } from "effect";
import { fromPromise } from "xstate";
import { RuntimeClient } from "./runtime-client";

// types
import type { ClientRuntimeServices } from "./runtime-client";

// Builds an XState promise actor from an Effect program. The actor's abort signal
// is forwarded to the managed runtime so cancelled machines stop in-flight work
export const effectActor = <Output, Input, Error>(effect: (input: Input) => Effect.Effect<Output, Error, ClientRuntimeServices>) =>
  fromPromise<Output, Input>(({ input, signal }) => RuntimeClient.runPromise(effect(input), { signal }));
