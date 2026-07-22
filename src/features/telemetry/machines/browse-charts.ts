// services, features, and other libraries
import { assign, setup, assertEvent } from "xstate";

// types
import type { BrowseCharts } from "@/features/telemetry/domain";
import type { useUrlScribe } from "@/hooks";

// constants
import { INITIAL_BROWSE_CHARTS } from "@/features/telemetry/domain";

export const browseChartsMachine = setup({
  types: {} as {
    events:
      | { readonly type: "urlSynced"; browseCharts: Partial<BrowseCharts>; navigate: ReturnType<typeof useUrlScribe>["navigate"] }
      | { readonly type: "slChanged"; sl: BrowseCharts["sl"] };
    context: BrowseCharts & { navigate?: ReturnType<typeof useUrlScribe>["navigate"] };
  },
  actions: {
    syncUrl: assign(({ context, event }) => {
      assertEvent(event, "urlSynced");
      return { ...context, ...event.browseCharts, navigate: event.navigate } as const satisfies BrowseCharts & {
        navigate?: ReturnType<typeof useUrlScribe>["navigate"];
      };
    }),

    changeSl: assign(({ context, event }) => {
      assertEvent(event, "slChanged");
      return { ...context, sl: event.sl } as const satisfies BrowseCharts;
    }),

    navigate: ({ context }) => {
      const { navigate, ...rest } = context;
      navigate?.("/high-score", rest);
    },
  },
  delays: { debounce: 1000 },
}).createMachine({
  id: "browseCharts",
  context: INITIAL_BROWSE_CHARTS,
  initial: "idle",

  on: {
    urlSynced: { target: ".idle", actions: "syncUrl" },
    slChanged: { target: ".debouncing", actions: "changeSl" },
  },

  states: {
    idle: {},

    debouncing: { after: { debounce: { target: "idle", actions: "navigate" } } },
  },
});
