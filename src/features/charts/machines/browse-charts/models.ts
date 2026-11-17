// services, features, and other libraries
import { Predicate, Schema } from "effect";
import { SolutionsLanguage } from "@/features/game/domain/models";

// types
import type { useUrlScribe } from "@/hooks/use-url-scribe";
export type Navigate = ReturnType<typeof useUrlScribe>["navigate"];
export type BrowseCharts = typeof BrowseCharts.Type;

export const Navigate = Schema.declare<Navigate>((input): input is Navigate => Predicate.isFunction(input), { title: "Navigate" });

export const BrowseCharts = Schema.Struct({ sl: SolutionsLanguage });
