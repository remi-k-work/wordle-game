// services, features, and other libraries
import { Effect } from "effect";
import { fromPromise } from "xstate";
import { RuntimeClient } from "./runtime-client";

// types
import type { ClientRuntimeServices } from "./runtime-client";

// Builds an XState promise actor from an Effect program. The actor's abort signal
// is forwarded to the managed runtime so cancelled machines stop in-flight work
//
// This lives apart from `domain/helpers.ts` on purpose. The RPC clients that
// `lib/runtime-client.ts` composes are built with `makeRpcClient` from
// `domain/helpers.ts`, so importing the runtime from there would close the cycle
// `domain/helpers` → `lib/runtime-client` → `features/*/rpc/client` →
// `domain/helpers`. Under native ESM the cycle leaves `makeRpcClient`
// `undefined` when `domain/helpers` is the cycle's entry point, which crashes
// every module reached through it — including `domain/helpers.server` and every
// chart/telemetry query that imports `dieOnDbFailure` from it. This module is
// the only one that needs both halves, so the edge is cut here
export const effectActor = <Output, Input, Error>(effect: (input: Input) => Effect.Effect<Output, Error, ClientRuntimeServices>) =>
  fromPromise<Output, Input>(({ input, signal }) => RuntimeClient.runPromise(effect(input), { signal }));
