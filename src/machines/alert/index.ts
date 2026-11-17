// services, features, and other libraries
import { assertEvent } from "xstate";
import { setup } from "./setup";

export const alertMachine = setup.createMachine({
  id: "alert",
  initial: "closed",

  on: {
    opened: ({ event }) => (event.alertType === "forfeit-run" ? { target: ".forfeit-run" } : undefined),
    cancelled: { target: ".closed" },
    // The dialog closes for good only once the confirm has settled: while the
    // callback runs the alert sits in `submitting`, so the async lifecycle is
    // modeled by the machine instead of being fire-and-forget from a
    // synchronous action
    okayed: { target: ".submitting" },
  },

  states: {
    closed: {},
    "forfeit-run": {},

    submitting: {
      invoke: {
        src: "runOkayedActor",
        input: ({ event }) => {
          assertEvent(event, "okayed");
          return event.onOkayed;
        },
        onDone: { target: "closed" },
        onError: (args, enq) => {
          enq(args.actions.logFailure, { self: args.self, error: args.event.error });
          return { target: "closed" };
        },
      },
    },
  },
});
