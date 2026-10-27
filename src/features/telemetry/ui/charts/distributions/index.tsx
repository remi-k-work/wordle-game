// components
import { T } from "gt-react";
import { ChartTabs } from "@/features/telemetry/ui/charts/chart-tabs";
import { GuessDistributionChart } from "./guess";
import { TimeToSolveDistributionChart } from "./time-to-solve";
import { ArcadeStreakDistributionChart } from "./arcade-streak";

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
