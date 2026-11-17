// services, features, and other libraries
import { setup } from "./setup";

export const modalMachine = setup.createMachine({
  id: "modal",
  initial: "closed",

  on: {
    opened: ({ event }) => ({ target: `.${event.modalType}` }),
    closed: { target: ".closed" },
  },

  states: { closed: {}, help: {}, status: {}, "voice-settings": {}, "high-score": {}, "override-hack": {} },
});
