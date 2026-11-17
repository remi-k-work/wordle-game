// services, features, and other libraries
import { Effect, Predicate, Schema } from "effect";
import { setupEffect } from "@xstate/effect";
import { BrowseCharts } from "@/features/charts/domain/models";
import { SolutionsLanguage } from "@/features/game/domain/models";

// types
import type { useUrlScribe } from "@/hooks/use-url-scribe";
type Navigate = ReturnType<typeof useUrlScribe>["navigate"];

// constants
import { INITIAL_BROWSE_CHARTS } from "@/features/charts/domain/constants";

const Navigate = Schema.declare<Navigate>((input): input is Navigate => Predicate.isFunction(input), { title: "Navigate" });

export const browseChartsMachine = setupEffect({
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
}).createMachine({
  id: "browseCharts",
  context: INITIAL_BROWSE_CHARTS,
  initial: "idle",

  on: {
    urlSynced: { target: ".idle", context: ({ event }) => ({ ...event.browseCharts, navigate: event.navigate }) },
    slChanged: { target: ".debouncing", context: ({ context, event }) => ({ ...context, sl: event.sl }) },
  },

  states: {
    idle: {},

    debouncing: {
      after: {
        debounce: (args, enq) => {
          const { navigate, ...browseCharts } = args.context;
          enq(args.actions.navigate, { self: args.self, browseCharts, navigate });
          return { target: "idle" };
        },
      },
    },
  },
});
