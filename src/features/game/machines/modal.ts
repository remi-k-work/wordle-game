// services, features, and other libraries
import { setup } from "xstate";

export const modalMachine = setup({
  types: {} as {
    events: { readonly type: "opened"; readonly modalType: "help" | "status" | "voice-settings" } | { readonly type: "closed" };
  },
}).createMachine({
  id: "modal",
  initial: "closed",
  on: {
    closed: { target: ".closed" },
    opened: [
      { guard: ({ event }) => event.modalType === "help", target: ".help" },
      { guard: ({ event }) => event.modalType === "status", target: ".status" },
      { guard: ({ event }) => event.modalType === "voice-settings", target: ".voice-settings" },
    ],
  },
  states: { closed: {}, help: {}, status: {}, "voice-settings": {} },
});
