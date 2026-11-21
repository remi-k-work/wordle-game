// services, features, and other libraries
import { setupEffect } from "@xstate/effect";
import { Events, Actions } from "./models";
import { runOkayedActor } from "./actors";
import { actions } from "./actions";

export const setup = setupEffect({
  schemas: {
    events: Events,
    actions: Actions,
  },
  actors: { runOkayedActor },
  actions,
});
