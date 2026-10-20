// services, features, and other libraries
import { useGT } from "gt-tanstack-start";

// components
import { DistributionSkeleton } from "@/features/telemetry/ui/charts/distribution-skeleton";

// The loading placeholder for the time-to-solve distribution tab. Lives apart from
// the chart itself (whose module embeds recharts) so route-level Suspense fallbacks
// never statically bundle recharts
export function TimeToSolveDistributionChartSkeleton() {
  const gt = useGT();

  return <DistributionSkeleton title={gt("Time taken to solve a word")} />;
}
