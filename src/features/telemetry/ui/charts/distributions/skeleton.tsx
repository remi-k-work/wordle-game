// react
import { useMemo } from "react";

// components
import { ChartTabsSkeleton } from "@/features/telemetry/ui/charts/chart-tabs";
import { ArcadeStreakDistributionChartSkeleton } from "./arcade-streak/skeleton";
import { GuessDistributionChartSkeleton } from "./guess/skeleton";
import { TimeToSolveDistributionChartSkeleton } from "./time-to-solve/skeleton";

// The tabbed loading placeholder for the distribution section. Every piece is
// recharts-free, so the statically-bundled page shell stays lean while the real
// charts load in their own chunk
export function DistributionChartsSkeleton() {
  const tabs = useMemo(
    () => [
      { value: "guesses", skeleton: <GuessDistributionChartSkeleton /> },
      { value: "time", skeleton: <TimeToSolveDistributionChartSkeleton /> },
      { value: "streak", skeleton: <ArcadeStreakDistributionChartSkeleton /> },
    ],
    []
  );

  return <ChartTabsSkeleton defaultValue="guesses" tabs={tabs} />;
}
