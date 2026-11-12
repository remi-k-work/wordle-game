// services, features, and other libraries
import { setup } from "xstate";

// Every modal the app can show. The single source of truth shared by the event
// union below and by state/modal.ts's keyed selectors (imported, not re-declared)
export type ModalType = "help" | "status" | "voice-settings" | "high-score" | "override-hack";

export const modalMachine = setup({
  types: {} as {
    events: { readonly type: "opened"; readonly modalType: ModalType } | { readonly type: "closed" };
  },
}).createMachine({
  id: "modal",
  initial: "closed",

  on: {
    opened: [
      { guard: ({ event }) => event.modalType === "help", target: ".help" },
      { guard: ({ event }) => event.modalType === "status", target: ".status" },
      { guard: ({ event }) => event.modalType === "voice-settings", target: ".voice-settings" },
      { guard: ({ event }) => event.modalType === "high-score", target: ".high-score" },
      { guard: ({ event }) => event.modalType === "override-hack", target: ".override-hack" },
    ],
    closed: ".closed",
  },

  states: { closed: {}, help: {}, status: {}, "voice-settings": {}, "high-score": {}, "override-hack": {} },
});
