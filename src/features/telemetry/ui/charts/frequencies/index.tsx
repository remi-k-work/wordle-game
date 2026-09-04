// services, features, and other libraries
import { useMemo } from "react";

// components
import { T } from "gt-next";
import { ChartTabs, ChartTabsSkeleton } from "@/features/telemetry/ui/charts/chart-tabs";
import { OpeningGuessesFrequencyChart, OpeningGuessesFrequencyChartSkeleton } from "./opening-guesses";
import { FailedWordsFrequencyChart, FailedWordsFrequencyChartSkeleton } from "./failed-words";
import { RunDeathReasonFrequencyChart, RunDeathReasonFrequencyChartSkeleton } from "./run-death-reason";
import { HardestWordsLeaderboardChart, HardestWordsLeaderboardChartSkeleton } from "@/features/telemetry/ui/charts/leaderboards/hardest-words";

// types
import type { SolutionsLanguage } from "@/features/game/domain";

interface FrequencyChartsProps {
  solutionsLanguage: SolutionsLanguage;
}

export function FrequencyCharts({ solutionsLanguage }: FrequencyChartsProps) {
  const tabs = useMemo(
    () => [
      {
        value: "firstWords",
        label: <T>First Words</T>,
        content: <OpeningGuessesFrequencyChart solutionsLanguage={solutionsLanguage} />,
      },
      {
        value: "missedWords",
        label: <T>Missed Words</T>,
        content: <FailedWordsFrequencyChart solutionsLanguage={solutionsLanguage} />,
      },
      {
        value: "runDeaths",
        label: <T>Run Deaths</T>,
        content: <RunDeathReasonFrequencyChart solutionsLanguage={solutionsLanguage} />,
      },
      {
        value: "hardestWords",
        label: <T>Hardest Words</T>,
        content: <HardestWordsLeaderboardChart solutionsLanguage={solutionsLanguage} />,
      },
    ],
    [solutionsLanguage]
  );

  return <ChartTabs defaultValue="firstWords" tabs={tabs} />;
}

export function FrequencyChartsSkeleton() {
  const tabs = useMemo(
    () => [
      { value: "firstWords", skeleton: <OpeningGuessesFrequencyChartSkeleton /> },
      { value: "missedWords", skeleton: <FailedWordsFrequencyChartSkeleton /> },
      { value: "runDeaths", skeleton: <RunDeathReasonFrequencyChartSkeleton /> },
      { value: "hardestWords", skeleton: <HardestWordsLeaderboardChartSkeleton /> },
    ],
    []
  );

  return <ChartTabsSkeleton defaultValue="firstWords" tabs={tabs} />;
}
