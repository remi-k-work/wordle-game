// components
import { ChartTabsSkeleton } from "@/features/telemetry/ui/charts/chart-tabs";
import { FailedWordsFrequencyChartSkeleton } from "./failed-words/skeleton";
import { OpeningGuessesFrequencyChartSkeleton } from "./opening-guesses/skeleton";
import { RunDeathReasonFrequencyChartSkeleton } from "./run-death-reason/skeleton";
import { HardestWordsLeaderboardChartSkeleton } from "@/features/telemetry/ui/charts/leaderboards/hardest-words/skeleton";

// The tabbed loading placeholder for the frequency section. Every piece is
// recharts-free, so the statically-bundled page shell stays lean while the real
// charts load in their own chunk
export function FrequencyChartsSkeleton() {
  return (
    <ChartTabsSkeleton
      defaultValue="firstWords"
      tabs={[
        { value: "firstWords", skeleton: <OpeningGuessesFrequencyChartSkeleton /> },
        { value: "missedWords", skeleton: <FailedWordsFrequencyChartSkeleton /> },
        { value: "runDeaths", skeleton: <RunDeathReasonFrequencyChartSkeleton /> },
        { value: "hardestWords", skeleton: <HardestWordsLeaderboardChartSkeleton /> },
      ]}
    />
  );
}
