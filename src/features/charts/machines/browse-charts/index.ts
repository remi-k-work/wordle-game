// services, features, and other libraries
import { setup } from "./setup";

// constants
import { INITIAL_BROWSE_CHARTS } from "./constants";

export const browseChartsMachine = setup.createMachine({
  id: "browseCharts",
  context: INITIAL_BROWSE_CHARTS,
  initial: "idle",

  on: {
    urlSynced: { target: ".idle", context: ({ event }) => ({ ...event.browseCharts, navigate: event.navigate }) },
    solutionsLanguageChanged: { target: ".debouncing", context: ({ context, event }) => ({ ...context, sl: event.solutionsLanguage }) },
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
