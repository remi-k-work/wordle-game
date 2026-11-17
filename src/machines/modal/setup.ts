// services, features, and other libraries
import { Schema } from "effect";
import { setupEffect } from "@xstate/effect";

export const setup = setupEffect({
  schemas: {
    events: {
      opened: Schema.Struct({
        modalType: Schema.Literals(["help", "status", "voice-settings", "high-score", "override-hack"]),
      }),
      closed: Schema.Struct({}),
    },
  },
});
