// services, features, and other libraries
import { Schema } from "effect";
import { setupEffect } from "@xstate/effect";

// Every modal the app can show; the single source of truth
export type ModalType = "help" | "status" | "voice-settings" | "high-score" | "override-hack";

export const modalMachine = setupEffect({
  schemas: {
    events: {
      opened: Schema.Struct({
        modalType: Schema.Literals(["help", "status", "voice-settings", "high-score", "override-hack"]),
      }),
      closed: Schema.Struct({}),
    },
  },
}).createMachine({
  id: "modal",
  initial: "closed",

  on: {
    opened: ({ event }) => ({ target: `.${event.modalType}` }),
    closed: { target: ".closed" },
  },

  states: { closed: {}, help: {}, status: {}, "voice-settings": {}, "high-score": {}, "override-hack": {} },
});
