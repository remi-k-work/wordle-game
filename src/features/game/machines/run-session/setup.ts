// services, features, and other libraries
import { setupEffect } from "@xstate/effect";
import { RunSession, Events, Actions } from "./models";
import { actions } from "./actions";
import { guards } from "./guards";

export const setup = setupEffect({
  schemas: {
    context: RunSession,

    // The machine is hydrated from the persisted KVS atom, whose value is the createActor input
    input: RunSession,
    events: Events,
    actions: Actions,
  },
  guards,
  actions,
});
