// services, features, and other libraries
import { setupEffect } from "@xstate/effect";
import { Keyboard, Events, Actions } from "./models";
import { actions } from "./actions";

export const setup = setupEffect({
  schemas: {
    context: Keyboard,
    events: Events,
    actions: Actions,
  },
  actions,
});
