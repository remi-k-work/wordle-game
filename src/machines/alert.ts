// services, features, and other libraries
import { Effect, Predicate, Schema } from "effect";
import { assertEvent } from "xstate";
import { createEffectLogic, setupEffect } from "@xstate/effect";

// types
import type { EffectSourceArgs } from "@xstate/effect";

// A confirm callback that rejects is modeled as a typed error rather than an
// anonymous defect, so the machine can log it deliberately instead of letting
// the actor die with it
class AlertOkayedError extends Schema.TaggedError<AlertOkayedError, { readonly brand: unique symbol }>()("AlertOkayedError", {
  cause: Schema.Defect(),
}) {}

// The confirm callback rides along on the `okayed` event, so its type is the
// invoke actor's input. Effect Schema has no built-in function type, so it is
// declared with a type guard (the only shape Effect Schema offers for opaque
// values)
const OkayedCallback = Schema.declare<() => void | Promise<void>>((input): input is () => void | Promise<void> => Predicate.isFunction(input), {
  title: "OkayedCallback",
});

// Waits for the (possibly promise-returning) confirm callback to settle
const runOkayed = createEffectLogic(({ input }: EffectSourceArgs<() => void | Promise<void>>) =>
  Effect.tryPromise({
    // `await` inside an async thunk funnels both a sync throw and a rejection into the error channel
    try: async () => {
      await input();
    },
    catch: (cause) => new AlertOkayedError({ cause }),
  })
);

// The machine's only open state (kept beside the `states` node below so the two
// cannot drift); state/alert.ts keys its visibility selector off this
export const ALERT_FORFEIT_RUN_STATE = "forfeit-run" as const;

export const alertMachine = setupEffect({
  schemas: {
    events: {
      opened: Schema.Struct({ alertType: Schema.Literal("forfeit-run") }),
      okayed: Schema.Struct({ onOkayed: OkayedCallback }),
      cancelled: Schema.Struct({}),
    },
    actions: { logFailure: { params: Schema.Struct({ error: Schema.Defect() }) } },
  },
  actors: { runOkayed },
  actions: {
    logFailure: ({ error }) => Effect.logError("[ALERT OKAYED FAILED]:", error),
  },
}).createMachine({
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
        src: "runOkayed",
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
