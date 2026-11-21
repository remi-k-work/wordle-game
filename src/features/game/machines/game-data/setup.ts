// services, features, and other libraries
import { setupEffect } from "@xstate/effect";
import { GameData, Events } from "./models";
import { onLoadingActor, selectSecretWordActor } from "./actors";
import { Actions, actions } from "./actions";

export const setup = setupEffect({
  schemas: {
    context: GameData,
    events: Events,
    actions: Actions,
  },
  actors: { onLoadingActor, selectSecretWordActor },
  actions,
});
