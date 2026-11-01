// components
import { T } from "gt-react";
import { ChartTabs } from "@/features/charts/ui/chart-tabs";
import { OpeningGuessesFrequencyChart } from "@/features/charts/ui/opening-guesses-frequency";
import { FailedWordsFrequencyChart } from "@/features/charts/ui/failed-words-frequency";
import { RunDeathReasonFrequencyChart } from "@/features/charts/ui/run-death-reason-frequency";
import { HardestWordsLeaderboardChart } from "@/features/charts/ui/hardest-words-leaderboard";

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
