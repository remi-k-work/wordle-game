// services, features, and other libraries
import { setupEffect } from "@xstate/effect";
import { Events } from "./models";

export const setup = setupEffect({
  schemas: {
    events: Events,
  },
});
