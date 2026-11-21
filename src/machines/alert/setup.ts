// services, features, and other libraries
import { setupEffect } from "@xstate/effect";
import { Events } from "./models";
import { runOkayedActor } from "./actors";
import { Actions, actions } from "./actions";

export const setup = setupEffect({
  schemas: {
    events: Events,
    actions: Actions,
  },
  actors: { runOkayedActor },
  actions,
});
