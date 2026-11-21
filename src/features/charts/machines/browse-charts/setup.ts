// services, features, and other libraries
import { Schema } from "effect";
import { setupEffect } from "@xstate/effect";
import { BrowseCharts, Navigate, Events } from "./models";
import { Actions, actions } from "./actions";

export const setup = setupEffect({
  schemas: {
    context: Schema.Struct({ ...BrowseCharts.fields, navigate: Schema.optional(Navigate) }),
    events: Events,
    actions: Actions,
  },
  actions,
  delays: { debounce: 1000 },
});
