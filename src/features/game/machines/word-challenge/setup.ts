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
  // Named delays so the reveal/reject windows are readable here and overridable in tests
  delays: { revealDuration: 1500, rejectedDuration: 4000 },
  actions,
});
