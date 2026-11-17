// services, features, and other libraries
import { Effect, Schema } from "effect";
import { setupEffect } from "@xstate/effect";
import { SolutionsLanguage } from "@/features/game/domain/models";
import { BrowseCharts, Navigate } from "./models";

export const setup = setupEffect({
  schemas: {
    context: Schema.Struct({ ...BrowseCharts.fields, navigate: Schema.optional(Navigate) }),
    events: {
      urlSynced: Schema.Struct({ browseCharts: BrowseCharts, navigate: Navigate }),
      slChanged: Schema.Struct({ sl: SolutionsLanguage }),
    },
    actions: { navigate: { params: Schema.Struct({ browseCharts: BrowseCharts, navigate: Schema.optional(Navigate) }) } },
  },
  actions: {
    navigate: ({ browseCharts, navigate }) =>
      Effect.sync(() => {
        navigate?.("/high-score", browseCharts);
      }),
  },
  delays: { debounce: 1000 },
});
