// services, features, and other libraries
import { setupEffect } from "@xstate/effect";
import { GameData, GameDataFailure, Events, Actions } from "./models";
import { onLoadingActor, selectSecretWordActor } from "./actors";
import { actions } from "./actions";

// constants
import { GAME_DATA_TIMEOUT_MS } from "./constants";

export const setup = setupEffect({
  // The deadline the loading/selectingWord state timeouts resolve against
  delays: { gameDataTimeout: GAME_DATA_TIMEOUT_MS },
  schemas: {
    context: GameData,
    events: Events,
    actions: Actions,
  },
  // `failure` carries which operation failed as state input; every top-level
  // state is listed so the machine's targets stay typed against the declared set
  states: {
    loading: {},
    ready: {},
    selectingWord: {},
    failure: { schemas: { input: GameDataFailure } },
  },
  actors: { onLoadingActor, selectSecretWordActor },
  actions,
});
