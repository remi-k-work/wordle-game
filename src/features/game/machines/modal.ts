// services, features, and other libraries
import { setup } from "xstate";

// types
type ModalType = "help" | "status" | "voice-settings";

export const modalMachine = setup({
  types: {} as {
    events: { readonly type: "modal.opened"; readonly modalType: ModalType } | { readonly type: "modal.closed" };
  },
}).createMachine({
  id: "modal",
  initial: "closed",
  on: {
    "modal.closed": { target: ".closed" },
    "modal.opened": [
      { guard: ({ event }) => event.modalType === "help", target: ".help" },
      { guard: ({ event }) => event.modalType === "status", target: ".status" },
      { guard: ({ event }) => event.modalType === "voice-settings", target: ".voice-settings" },
    ],
  },
  states: { closed: {}, help: {}, status: {}, "voice-settings": {} },
});
