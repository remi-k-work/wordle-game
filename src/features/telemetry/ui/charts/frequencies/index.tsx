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
  return (
    <ChartTabs
      defaultValue="firstWords"
      tabs={[
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
      ]}
    />
  );
}

// The skeleton moved to ./skeleton so route-level Suspense fallbacks never
// statically bundle recharts; re-exported here so the module's public API is
// unchanged
export { FrequencyChartsSkeleton } from "./skeleton";
