// services, features, and other libraries
import { useGT } from "gt-react";

// components
import { BrowseChartsShell } from "./browse-charts-shell";

// The loading placeholder for the browse-charts section header. Lives apart from
// the live toggle (whose module wires the chart-swap machine) so the statically-
// bundled page shell stays lean
export function BrowseChartsSkeleton() {
  const gt = useGT();

  return <BrowseChartsShell label={gt("Switch Chart Vocabulary Language")} checked={false} disabled onCheckedChange={() => {}} />;
}
