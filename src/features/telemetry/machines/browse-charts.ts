// services, features, and other libraries
import { assign, setup, assertEvent } from "xstate";

// types
import type { BrowseCharts } from "@/features/telemetry/domain";
import type { useUrlScribe } from "@/hooks";

// constants
import { INITIAL_BROWSE_CHARTS } from "@/features/telemetry/domain";

export const browseChartsMachine = setup({
  types: {} as {
    events: { readonly type: "slChanged"; sl: BrowseCharts["sl"] };
    context: BrowseCharts & { navigate: ReturnType<typeof useUrlScribe>["navigate"] };
    input: BrowseCharts & { navigate: ReturnType<typeof useUrlScribe>["navigate"] };
  },
  actions: {
    changeSolutionsLanguage: assign(({ context, event }) => {
      assertEvent(event, "slChanged");
      return { ...context, sl: event.sl } as const satisfies BrowseCharts;
    }),

    navigate: ({ context }) => {
      const { navigate, ...rest } = context;
      navigate("/high-score", { ...rest } as const satisfies BrowseCharts);
    },
  },
  delays: { debounce: 1000 },
}).createMachine({
  id: "browseCharts",
  context: ({ input }) => ({ ...INITIAL_BROWSE_CHARTS, ...input }) as const satisfies BrowseCharts,
  initial: "idle",

  on: {
    slChanged: { target: ".debouncing", actions: "changeSolutionsLanguage" },
  },

  states: {
    idle: {},

    debouncing: { after: { debounce: { target: "idle", actions: "navigate" } } },
  },
});
