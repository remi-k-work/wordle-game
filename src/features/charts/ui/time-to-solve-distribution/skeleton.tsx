// services, features, and other libraries
import { useGT } from "gt-react";

// components
import { ChartSkeleton } from "@/features/charts/ui/chart-skeleton";

// The loading placeholder for the time-to-solve distribution tab; lives apart from
// the chart itself (whose module embeds recharts) so route-level Suspense fallbacks
// never statically bundle recharts
export function TimeToSolveDistributionChartSkeleton() {
  const gt = useGT();

  return <ChartSkeleton title={gt("Time taken to solve a word")} />;
}
