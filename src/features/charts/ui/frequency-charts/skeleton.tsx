// components
import { ChartTabsSkeleton } from "@/features/charts/ui/chart-tabs";
import { FailedWordsFrequencyChartSkeleton } from "@/features/charts/ui/failed-words-frequency/skeleton";
import { OpeningGuessesFrequencyChartSkeleton } from "@/features/charts/ui/opening-guesses-frequency/skeleton";
import { RunDeathReasonFrequencyChartSkeleton } from "@/features/charts/ui/run-death-reason-frequency/skeleton";
import { HardestWordsLeaderboardChartSkeleton } from "@/features/charts/ui/hardest-words-leaderboard/skeleton";

// The tabbed loading placeholder for the frequency section; every piece is
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
