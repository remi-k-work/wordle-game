// services, features, and other libraries
import { DateTime, Option } from "effect";
import { assign, assertEvent, setup } from "xstate";
import { bankWordScore, finishRunSession, resetCurrentRunSession, startRunSession } from "@/features/game/domain";

// types
import type { RunSession, WordScore } from "@/features/game/domain";

export const runSessionMachine = setup({
  types: {} as {
    events:
      | { readonly type: "runSession.reset" }
      | { readonly type: "runSession.started"; readonly now: DateTime.Utc }
      | { readonly type: "runSession.wordBanked"; readonly wordScore: WordScore }
      | { readonly type: "runSession.finished" };
    context: RunSession;
    input: RunSession;
    tags: "activeRun";
  },
  guards: {
    hasActiveRun: ({ context }) => Option.isSome(context.runId),
  },
  actions: {
    resetRun: assign(({ context }) => resetCurrentRunSession(context)),
    startRun: assign(({ context, event }) => {
      assertEvent(event, "runSession.started");
      return startRunSession(context, event.now);
    }),
    bankWord: assign(({ context, event }) => {
      assertEvent(event, "runSession.wordBanked");
      return bankWordScore(context, event.wordScore);
    }),
    finishRun: assign(({ context }) => finishRunSession(context)),
  },
}).createMachine({
  id: "runSession",
  // Hydrate the machine with the input from the KVS Atom
  context: ({ input }) => ({ ...input }),
  initial: "classifying",
  states: {
    classifying: {
      always: [{ guard: { type: "hasActiveRun" }, target: "active" }, { target: "inactive" }],
    },
    inactive: {
      on: {
        "runSession.reset": {
          target: "classifying",
          actions: [{ type: "resetRun" }],
        },
        "runSession.started": {
          target: "classifying",
          actions: [{ type: "startRun" }],
        },
      },
    },
    active: {
      tags: ["activeRun"],
      on: {
        "runSession.reset": {
          target: "classifying",
          actions: [{ type: "resetRun" }],
        },
        "runSession.started": {
          target: "classifying",
          actions: [{ type: "startRun" }],
        },
        "runSession.wordBanked": {
          target: "classifying",
          actions: [{ type: "bankWord" }],
        },
        "runSession.finished": {
          target: "classifying",
          actions: [{ type: "finishRun" }],
        },
      },
    },
  },
});
