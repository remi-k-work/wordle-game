// services, features, and other libraries
import { Option, Schema } from "effect";
import { BrowseCharts } from "./models";

// constants
import { INITIAL_BROWSE_CHARTS } from "./constants";

// Schema.decodeUnknownOption builds a parser on every call, so build it once at module scope instead of once per URL change
const decodeBrowseChartsOption = Schema.decodeUnknownOption(BrowseCharts);

// Decodes the raw URL query (as parsed by use-url-scribe) into BrowseCharts
export const decodeBrowseCharts = (searchEntries: Readonly<Record<string, string>>) =>
  Option.getOrElse(decodeBrowseChartsOption(searchEntries), () => INITIAL_BROWSE_CHARTS);
