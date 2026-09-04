// services, features, and other libraries
import { useMemo } from "react";

// components
import { T } from "gt-next";
import { ChartTabs, ChartTabsSkeleton } from "@/features/telemetry/ui/charts/chart-tabs";
import { GuessDistributionChart, GuessDistributionChartSkeleton } from "./guess";
import { TimeToSolveDistributionChart, TimeToSolveDistributionChartSkeleton } from "./time-to-solve";
import { ArcadeStreakDistributionChart, ArcadeStreakDistributionChartSkeleton } from "./arcade-streak";

// types
import type { SolutionsLanguage } from "@/features/game/domain";

interface DistributionChartsProps {
  solutionsLanguage: SolutionsLanguage;
}

export function DistributionCharts({ solutionsLanguage }: DistributionChartsProps) {
  const tabs = useMemo(
    () => [
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
    ],
    [solutionsLanguage]
  );

  return <ChartTabs defaultValue="guesses" tabs={tabs} />;
}

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
