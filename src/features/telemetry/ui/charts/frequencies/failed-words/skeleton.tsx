// services, features, and other libraries
import { useGT } from "gt-react";

// components
import { HorizontalBarSkeleton } from "@/features/telemetry/ui/charts/horizontal-bar-skeleton";

// The loading placeholder for the failed words frequency tab. Lives apart from the
// chart itself (whose module embeds recharts) so route-level Suspense fallbacks
// never statically bundle recharts
export function FailedWordsFrequencyChartSkeleton() {
  const gt = useGT();

  return <HorizontalBarSkeleton title={gt("Words that players failed to guess")} />;
}
