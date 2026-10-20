// services, features, and other libraries
import { useBrowseCharts } from "@/features/telemetry/hooks/use-browse-charts";
import { useGT } from "gt-tanstack-start";

// components
import { BrowseChartsShell } from "./browse-charts-shell";

// types
export function BrowseCharts() {
  const { sl, browseChartsMachineEvent } = useBrowseCharts();
  const gt = useGT();

  return (
    <BrowseChartsShell
      label={gt("Switch Chart Vocabulary Language")}
      checked={sl === "Pl"}
      onCheckedChange={(isPl) => browseChartsMachineEvent({ type: "slChanged", sl: isPl ? "Pl" : "En" })}
    />
  );
}

// The skeleton moved to ./skeleton so route-level Suspense fallbacks never bundle
// the chart-swap machine; re-exported here so the module's public API is unchanged
export { BrowseChartsSkeleton } from "./skeleton";
