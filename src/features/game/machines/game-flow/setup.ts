// services, features, and other libraries
import { setupEffect } from "@xstate/effect";
import { GameFlow, Events, Actions } from "./models";
import { actions } from "./actions";

export const setup = setupEffect({
  schemas: {
    context: GameFlow,

    // The flow is bootstrapped from the persisted run-session state; that flag is the createActor input
    input: GameFlow,
    events: Events,
    actions: Actions,
  },
  actions,
});
