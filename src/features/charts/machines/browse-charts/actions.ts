// services, features, and other libraries
import { Effect, Schema } from "effect";
import { BrowseCharts, Navigate } from "./models";

// types
import type { ActionImplementations } from "@/lib/machine-setup";

// The params schemas are the single source of truth for what each action is
// enqueued with; setup.ts wires them into `schemas.actions`
export const Actions = {
  navigate: { params: Schema.Struct({ browseCharts: BrowseCharts, navigate: Schema.optional(Navigate) }) },
};

export const actions = {
  navigate: ({ browseCharts, navigate }) =>
    Effect.sync(() => {
      navigate?.("/high-score", browseCharts);
    }),
} satisfies ActionImplementations<typeof Actions>;
