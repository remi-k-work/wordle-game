// services, features, and other libraries
import { Predicate, Schema } from "effect";
import { SolutionsLanguage } from "@/features/game/domain/models";

// types
import type { EventUnion } from "@/lib/machine-setup";
import type { useUrlScribe } from "@/hooks/use-url-scribe";
export type Navigate = ReturnType<typeof useUrlScribe>["navigate"];
export type BrowseCharts = typeof BrowseCharts.Type;
export type Events = EventUnion<typeof Events>;

export const Navigate = Schema.declare<Navigate>((input): input is Navigate => Predicate.isFunction(input), { title: "Navigate" });
export const BrowseCharts = Schema.Struct({ sl: SolutionsLanguage });

// Events are part of the machine's interface
export const Events = {
  urlSynced: Schema.Struct({ browseCharts: BrowseCharts, navigate: Navigate }),
  solutionsLanguageChanged: Schema.Struct({ solutionsLanguage: SolutionsLanguage }),
};

// Action params are part of the machine's interface; implementations receive
// exactly these params (plus `self`)
export const Actions = {
  navigate: { params: Schema.Struct({ browseCharts: BrowseCharts, navigate: Schema.optional(Navigate) }) },
};
