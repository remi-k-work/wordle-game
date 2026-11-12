// services, features, and other libraries
import { Effect, Schema } from "effect";
import { assertEvent, fromPromise, setup } from "xstate";
import { runClientCommand } from "@/lib/runtime-client";

// A confirm callback that rejects is modeled as a typed error rather than an
// anonymous defect, so the machine can log it deliberately instead of letting
// the actor die with it
export class AlertOkayedError extends Schema.TaggedError<AlertOkayedError, { readonly brand: unique symbol }>()("AlertOkayedError", {
  cause: Schema.Defect(),
}) {}

// Waits for the (possibly promise-returning) confirm callback to settle. The
// callback only ever arrives with the `okayed` event — the dialog is its only
// producer — so the actor input is read from that event. A rejection is
// re-thrown as the tagged error above so the onError branch below can log it
const runOkayed = fromPromise(async ({ input }: { input: () => void | Promise<void> }) => {
  try {
    await input();
  } catch (cause) {
    throw new AlertOkayedError({ cause });
  }
});

// The machine's only open state (kept beside the `states` node below so the two
// cannot drift); state/alert.ts keys its visibility selector off this
export const ALERT_FORFEIT_RUN_STATE = "forfeit-run" as const;

export const alertMachine = setup({
  types: {} as {
    events:
      | { readonly type: "opened"; readonly alertType: "forfeit-run" }
      | { readonly type: "okayed"; readonly onOkayed: () => void | Promise<void> }
      | { readonly type: "cancelled" }
      // The invoked actor's error event, declared so onError can narrow to it
      | { readonly type: "xstate.error.actor.runOkayed"; readonly error: AlertOkayedError };
  },
  actors: { runOkayed },
}).createMachine({
  id: "alert",
  initial: "closed",

  on: {
    opened: [{ guard: ({ event }) => event.alertType === "forfeit-run", target: ".forfeit-run" }],
    cancelled: ".closed",
    // The dialog closes for good only once the confirm has settled: while the
    // callback runs the alert sits in `submitting`, so the async lifecycle is
    // modeled by the machine instead of being fire-and-forget from a
    // synchronous action
    okayed: ".submitting",
  },

  states: {
    closed: {},
    "forfeit-run": {},

    submitting: {
      invoke: {
        src: "runOkayed",
        input: ({ event }) => {
          assertEvent(event, "okayed");
          return event.onOkayed;
        },
        onDone: ".closed",
        onError: {
          target: ".closed",
          actions: ({ event }) => {
            // The confirm failed and the dialog still closes (there is nothing
            // to retry in place), but the failure is logged through the client
            // runtime instead of dying silently with the actor
            void runClientCommand(Effect.logError("[ALERT OKAYED FAILED]:", event.error));
          },
        },
      },
    },
  },
});
