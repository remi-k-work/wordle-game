// services, features, and other libraries
import { useGT } from "gt-react";

// components
import { DistributionSkeleton } from "@/features/telemetry/ui/charts/distribution-skeleton";

// The loading placeholder for the streak distribution tab. Lives apart from the
// chart itself (whose module embeds recharts) so route-level Suspense fallbacks
// never statically bundle recharts
export function ArcadeStreakDistributionChartSkeleton() {
  const gt = useGT();

  return <DistributionSkeleton title={gt("Streak before a loss")} />;
}
