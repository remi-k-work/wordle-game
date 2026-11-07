// services, features, and other libraries
import { useGT } from "gt-react";

// components
import { ChartSkeleton } from "@/features/charts/ui/chart-skeleton";

// The loading placeholder for the failed words frequency tab; lives apart from the
// chart itself (whose module embeds recharts) so route-level Suspense fallbacks
// never statically bundle recharts
export function FailedWordsFrequencyChartSkeleton() {
  const gt = useGT();

  return <ChartSkeleton title={gt("Words that players failed to guess")} />;
}
