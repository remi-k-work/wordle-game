// services, features, and other libraries
import { setupEffect } from "@xstate/effect";
import { WordMeta, Events } from "./models";
import { onLoadingActor, fetchAudioActor } from "./actors";

export const setup = setupEffect({
  schemas: {
    context: WordMeta,
    events: Events,
  },
  actors: { onLoadingActor, fetchAudioActor },
});
