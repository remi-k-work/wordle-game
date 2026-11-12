// services, features, and other libraries
import { assign, setup, assertEvent } from "xstate";

// types
import type { BrowseCharts } from "@/features/charts/domain/models";
import type { useUrlScribe } from "@/hooks/use-url-scribe";

// constants
import { INITIAL_BROWSE_CHARTS } from "@/features/charts/domain/constants";

export const browseChartsMachine = setup({
  types: {} as {
    events:
      // `browseCharts` is already schema-decoded by use-browse-charts, so the
      // context only ever holds a validated language
      | { readonly type: "urlSynced"; browseCharts: BrowseCharts; navigate: ReturnType<typeof useUrlScribe>["navigate"] }
      | { readonly type: "slChanged"; sl: BrowseCharts["sl"] };
    context: BrowseCharts & { navigate?: ReturnType<typeof useUrlScribe>["navigate"] };
  },
  actions: {
    syncUrl: assign(({ event }) => {
      assertEvent(event, "urlSynced");
      // `browseCharts` is already schema-decoded (full language included), so
      // only the navigate callback needs adding. Spreading the decoded
      // Schema.Class instance is safe (decoding yields a plain object)
      // oxlint-disable-next-line typescript/no-misused-spread -- decoded Schema.Class values are plain objects
      return { ...event.browseCharts, navigate: event.navigate } satisfies BrowseCharts & {
        navigate?: ReturnType<typeof useUrlScribe>["navigate"];
      };
    }),

    changeSl: assign(({ context, event }) => {
      assertEvent(event, "slChanged");
      // oxlint-disable-next-line typescript/no-misused-spread -- decoded Schema.Class values are plain objects
      return { ...context, sl: event.sl } satisfies BrowseCharts;
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
