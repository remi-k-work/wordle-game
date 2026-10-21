// types
import type { ActorOptions, AnyStateMachine } from "xstate";

// Debugging state machines: temporarily replace the export below with
// `createBrowserInspector().inspect` from "@statelyai/inspect" while developing.
// That package is a dev-only dependency whose transitive graph (ws, partysocket,
// superjson, ...) must never reach the client bundle, so it is deliberately not
// imported here (bundle-conditional)
export const inspect: ActorOptions<AnyStateMachine>["inspect"] | undefined = undefined;
