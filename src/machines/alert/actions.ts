// services, features, and other libraries
import { Effect } from "effect";

// types
import type { ActionImplementations } from "@/lib/machine-setup";
import type { Actions } from "./models";

export const actions: ActionImplementations<typeof Actions> = {
  logFailure: ({ error }) => Effect.logError("[ALERT OKAYED FAILED]:", error),
};
