// services, features, and other libraries
import { setupEffect } from "@xstate/effect";
import { HighScore, Events, Actions } from "./models";
import { top10HighScoresActor, addNewHighScoreActor } from "./actors";
import { actions } from "./actions";
import { guards } from "./guards";

export const setup = setupEffect({
  schemas: {
    context: HighScore,
    events: Events,
    actions: Actions,
  },
  guards,
  actors: { top10HighScoresActor, addNewHighScoreActor },
  delays: { successModalDelay: 3000 },
  actions,
});
