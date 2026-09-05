// services, features, and other libraries
import { useBrowseCharts } from "@/features/telemetry/hooks";
import { useGT } from "gt-next";

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

export function BrowseChartsSkeleton() {
  const gt = useGT();

  return <BrowseChartsShell label={gt("Switch Chart Vocabulary Language")} checked={false} disabled onCheckedChange={() => {}} />;
}
