// services, features, and other libraries
import { setup } from "xstate";

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
        event.onOkayed();
      },
    },
    cancelled: ".closed",
  },
  states: { closed: {}, "forfeit-run": {} },
});
