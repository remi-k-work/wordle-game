// services, features, and other libraries
import { setup, assign } from "xstate";

// types
type WordStatus = "Playing" | "Won" | "Lost";

export const turnMachine = setup({
  types: {} as {
    // We combined all submission outcomes into a single event with context
    events:
      | { readonly type: "turn.submitted"; readonly isValid: boolean; readonly status: WordStatus }
      | { readonly type: "turn.cleared" }
      | { readonly type: "turn.reset" };
    context: {
      readonly finalStatus: WordStatus;
    };
  },
  guards: {
    // The machine inspects the incoming event payload to route itself
    isValid: ({ event }) => event.type === "turn.submitted" && event.isValid,
    isWon: ({ context }) => context.finalStatus === "Won",
    isLost: ({ context }) => context.finalStatus === "Lost",
  },
}).createMachine({
  id: "turn",
  initial: "typing",
  context: { finalStatus: "Playing" },
  states: {
    typing: {
      on: {
        "turn.submitted": [
          // If valid, store the status and move to the 1.5s reveal animation
          {
            guard: "isValid",
            target: "revealing",
            actions: assign({ finalStatus: ({ event }) => event.status }),
          },
          // If invalid, instantly reject it
          { target: "rejected" },
        ],
      },
    },
    rejected: {
      on: {
        "turn.cleared": { target: "typing" },

        // Allow the user to spam enter without locking up
        "turn.submitted": [{ guard: "isValid", target: "revealing", actions: assign({ finalStatus: ({ event }) => event.status }) }],
      },
      after: {
        800: { target: "typing" },
      },
    },
    revealing: {
      after: {
        1500: [{ guard: "isWon", target: "gameOver" }, { guard: "isLost", target: "gameOver" }, { target: "typing" }],
      },
    },
    gameOver: {
      on: {
        "turn.reset": {
          target: "typing",
          actions: assign({ finalStatus: "Playing" }),
        },
      },
    },
  },
});
