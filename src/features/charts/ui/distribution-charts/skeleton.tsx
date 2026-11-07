// components
import { ChartTabsSkeleton } from "@/features/charts/ui/chart-tabs";
import { ArcadeStreakDistributionChartSkeleton } from "@/features/charts/ui/arcade-streak-distribution/skeleton";
import { GuessDistributionChartSkeleton } from "@/features/charts/ui/guess-distribution/skeleton";
import { TimeToSolveDistributionChartSkeleton } from "@/features/charts/ui/time-to-solve-distribution/skeleton";

// The tabbed loading placeholder for the distribution section; every piece is
// recharts-free, so the statically-bundled page shell stays lean while the real
// charts load in their own chunk
export function DistributionChartsSkeleton() {
  return (
    <ChartTabsSkeleton
      defaultValue="guesses"
      tabs={[
        { value: "guesses", skeleton: <GuessDistributionChartSkeleton /> },
        { value: "time", skeleton: <TimeToSolveDistributionChartSkeleton /> },
        { value: "streak", skeleton: <ArcadeStreakDistributionChartSkeleton /> },
      ]}
    />
  );
}
