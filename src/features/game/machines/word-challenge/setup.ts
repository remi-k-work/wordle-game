// services, features, and other libraries
import { setupEffect } from "@xstate/effect";
import { WordChallenge, Events, Actions } from "./models";
import { actions } from "./actions";
import { guards } from "./guards";

export const setup = setupEffect({
  schemas: {
    context: WordChallenge,
    events: Events,
    actions: Actions,
  },
  guards,
  actions,
});
