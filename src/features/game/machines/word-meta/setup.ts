// services, features, and other libraries
import { Schema } from "effect";
import { setupEffect } from "@xstate/effect";
import { TheSecretWord } from "@/features/game/domain/models";
import { WordMeta } from "./models";
import { onLoadingActor, fetchAudioActor } from "./actors";

export const setup = setupEffect({
  schemas: {
    context: WordMeta,
    events: {
      secretWordPicked: Schema.Struct({ theSecretWord: TheSecretWord }),
      resetRequested: Schema.Struct({}),
    },
  },
  actors: { onLoadingActor, fetchAudioActor },
});
