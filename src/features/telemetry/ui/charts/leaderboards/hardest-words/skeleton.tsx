// services, features, and other libraries
import { useGT } from "gt-react";

// components
import { HorizontalBarSkeleton } from "@/features/telemetry/ui/charts/horizontal-bar-skeleton";

// The loading placeholder for the hardest words leaderboard tab. Lives apart from
// the chart itself (whose module embeds recharts) so route-level Suspense fallbacks
// never statically bundle recharts
export function HardestWordsLeaderboardChartSkeleton() {
  const gt = useGT();

  return <HorizontalBarSkeleton title={gt("Hardest words by average solve time")} />;
}
