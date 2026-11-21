// services, features, and other libraries
import { Effect, Schema } from "effect";

// types
import type { ActionImplementations } from "@/lib/machine-setup";

// The params schemas are the single source of truth for what each action is
// enqueued with; setup.ts wires them into `schemas.actions`
export const Actions = {
  logFailure: { params: Schema.Struct({ error: Schema.Defect() }) },
};

export const actions: ActionImplementations<typeof Actions> = {
  logFailure: ({ error }) => Effect.logError("[ALERT OKAYED FAILED]:", error),
};
