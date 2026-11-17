// services, features, and other libraries
import { Effect, Schema } from "effect";
import { setupEffect } from "@xstate/effect";
import { OkayedCallback } from "./models";
import { runOkayedActor } from "./actors";

export const setup = setupEffect({
  schemas: {
    events: {
      opened: Schema.Struct({ alertType: Schema.Literal("forfeit-run") }),
      okayed: Schema.Struct({ onOkayed: OkayedCallback }),
      cancelled: Schema.Struct({}),
    },
    actions: { logFailure: { params: Schema.Struct({ error: Schema.Defect() }) } },
  },
  actors: { runOkayedActor },
  actions: {
    logFailure: ({ error }) => Effect.logError("[ALERT OKAYED FAILED]:", error),
  },
});
