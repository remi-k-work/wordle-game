// services, features, and other libraries
import { setupEffect } from "@xstate/effect";
import { GameSettings, Events } from "./models";
import { Actions, actions } from "./actions";

export const setup = setupEffect({
  schemas: {
    context: GameSettings,
    input: GameSettings,
    events: Events,
    actions: Actions,
  },
  actions,
});
