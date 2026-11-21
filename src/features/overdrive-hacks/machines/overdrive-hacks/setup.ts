// services, features, and other libraries
import { setupEffect } from "@xstate/effect";
import { OverdriveHacks, Events, Actions } from "./models";
import { applyEmpHackActor, applyOverrideHackActor, applySonarHackActor, fetchOverrideAudioActor } from "./actors";
import { actions } from "./actions";
import { guards } from "./guards";

export const setup = setupEffect({
  schemas: {
    context: OverdriveHacks,
    events: Events,
    actions: Actions,
  },
  guards,
  actors: { applyEmpHackActor, applySonarHackActor, applyOverrideHackActor, fetchOverrideAudioActor },
  actions,
});
