// react
import { useMemo } from "react";

// components
import { T } from "gt-react";
import { ChartTabs } from "@/features/telemetry/ui/charts/chart-tabs";
import { OpeningGuessesFrequencyChart } from "./opening-guesses";
import { FailedWordsFrequencyChart } from "./failed-words";
import { RunDeathReasonFrequencyChart } from "./run-death-reason";
import { HardestWordsLeaderboardChart } from "@/features/telemetry/ui/charts/leaderboards/hardest-words";

// types
import type { SolutionsLanguage } from "@/features/game/domain/models";

interface FrequencyChartsProps {
  solutionsLanguage: SolutionsLanguage;
}

export function FrequencyCharts({ solutionsLanguage }: FrequencyChartsProps) {
  const tabs = useMemo(
    () => [
      {
        value: "firstWords",
        label: <T>First Words</T>,
        render: () => <OpeningGuessesFrequencyChart solutionsLanguage={solutionsLanguage} />,
      },
      {
        value: "missedWords",
        label: <T>Missed Words</T>,
        render: () => <FailedWordsFrequencyChart solutionsLanguage={solutionsLanguage} />,
      },
      {
        value: "runDeaths",
        label: <T>Run Deaths</T>,
        render: () => <RunDeathReasonFrequencyChart solutionsLanguage={solutionsLanguage} />,
      },
      {
        value: "hardestWords",
        label: <T>Hardest Words</T>,
        render: () => <HardestWordsLeaderboardChart solutionsLanguage={solutionsLanguage} />,
      },
    ],
    [solutionsLanguage]
  );

  return <ChartTabs defaultValue="firstWords" tabs={tabs} />;
}

// The skeleton moved to ./skeleton so route-level Suspense fallbacks never
// statically bundle recharts; re-exported here so the module's public API is
// unchanged
export { FrequencyChartsSkeleton } from "./skeleton";
