// components
import { T } from "gt-react";
import { ChartTabs } from "@/features/charts/ui/chart-tabs";
import { GuessDistributionChart } from "@/features/charts/ui/guess-distribution";
import { TimeToSolveDistributionChart } from "@/features/charts/ui/time-to-solve-distribution";
import { ArcadeStreakDistributionChart } from "@/features/charts/ui/arcade-streak-distribution";

// types
import type { SolutionsLanguage } from "@/features/game/domain/models";

interface DistributionChartsProps {
  solutionsLanguage: SolutionsLanguage;
}

export function DistributionCharts({ solutionsLanguage }: DistributionChartsProps) {
  return (
    <ChartTabs
      defaultValue="guesses"
      tabs={[
        {
          value: "guesses",
          label: <T>Guesses to Win</T>,
          content: <GuessDistributionChart solutionsLanguage={solutionsLanguage} />,
        },
        {
          value: "time",
          label: <T>Time to Solve</T>,
          content: <TimeToSolveDistributionChart solutionsLanguage={solutionsLanguage} />,
        },
        {
          value: "streak",
          label: <T>Streak</T>,
          content: <ArcadeStreakDistributionChart solutionsLanguage={solutionsLanguage} />,
        },
      ]}
    />
  );
}

// The skeleton moved to ./skeleton so route-level Suspense fallbacks never
// statically bundle recharts; re-exported here so the module's public API is
// unchanged
export { DistributionChartsSkeleton } from "./skeleton";
