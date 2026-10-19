// services, features, and other libraries
import { Effect } from "effect";
import { setup } from "xstate";
import { runClientCommand } from "@/lib/runtime-client";

export const alertMachine = setup({
  types: {} as {
    events:
      | { readonly type: "opened"; readonly alertType: "forfeit-run" }
      | { readonly type: "okayed"; readonly onOkayed: () => void | Promise<void> }
      | { readonly type: "cancelled" };
  },
}).createMachine({
  id: "alert",
  initial: "closed",

  on: {
    opened: [{ guard: ({ event }) => event.alertType === "forfeit-run", target: ".forfeit-run" }],
    okayed: {
      target: ".closed",
      actions: ({ event }) => {
        // Bridge the (possibly promise-returning) callback through the client
        // runtime: runClientCommand logs failures via the app logger, so a
        // rejected callback can never escape the synchronous XState action as
        // an unhandled rejection
        void runClientCommand(Effect.tryPromise(() => Promise.resolve(event.onOkayed())));
      },
    },
    cancelled: ".closed",
  },

  states: { closed: {}, "forfeit-run": {} },
});
