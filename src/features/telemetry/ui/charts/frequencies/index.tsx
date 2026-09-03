// services, features, and other libraries
import { cn } from "@/lib/utils";

// components
import { Tabs } from "@base-ui/react";
import { T } from "gt-next";
import { ChartTab, ChartTabSkeleton } from "@/ui/chart-tab";
import { ChartPanel, ChartPanelSkeleton } from "@/ui/chart-panel";
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
  return (
    <Tabs.Root className="@container my-8 w-full" defaultValue="firstWords">
      <Tabs.List className="relative z-1 -mb-px flex w-[100cqw] scrollbar-none gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden">
        <ChartTab value="firstWords">
          <T>First Words</T>
        </ChartTab>
        <ChartTab value="missedWords">
          <T>Missed Words</T>
        </ChartTab>
        <ChartTab value="runDeaths">
          <T>Run Deaths</T>
        </ChartTab>
        <ChartTab value="hardestWords">
          <T>Hardest Words</T>
        </ChartTab>
        <Tabs.Indicator
          className={cn(
            "absolute top-0 left-0 -z-1 h-full w-(--active-tab-width) border-x border-t bg-surface-1",
            "translate-x-(--active-tab-left) transition-[translate,width] duration-300 ease-in-out"
          )}
        />
      </Tabs.List>
      <ChartPanel value="firstWords">
        <OpeningGuessesFrequencyChart solutionsLanguage={solutionsLanguage} />
      </ChartPanel>
      <ChartPanel value="missedWords">
        <FailedWordsFrequencyChart solutionsLanguage={solutionsLanguage} />
      </ChartPanel>
      <ChartPanel value="runDeaths">
        <RunDeathReasonFrequencyChart solutionsLanguage={solutionsLanguage} />
      </ChartPanel>
      <ChartPanel value="hardestWords">
        <HardestWordsLeaderboardChart solutionsLanguage={solutionsLanguage} />
      </ChartPanel>
    </Tabs.Root>
  );
}

export function FrequencyChartsSkeleton() {
  return (
    <Tabs.Root className="@container my-8 w-full" defaultValue="firstWords">
      <Tabs.List className="relative z-1 -mb-px flex w-[100cqw] scrollbar-none gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden">
        <ChartTabSkeleton value="firstWords" />
        <ChartTabSkeleton value="missedWords" />
        <ChartTabSkeleton value="runDeaths" />
        <ChartTabSkeleton value="hardestWords" />
        <Tabs.Indicator
          className={cn(
            "absolute top-0 left-0 -z-1 h-full w-(--active-tab-width) border-x border-t bg-surface-1",
            "translate-x-(--active-tab-left) transition-[translate,width] duration-300 ease-in-out"
          )}
        />
      </Tabs.List>
      <ChartPanelSkeleton value="firstWords">
        <OpeningGuessesFrequencyChartSkeleton />
      </ChartPanelSkeleton>
      <ChartPanelSkeleton value="missedWords">
        <FailedWordsFrequencyChartSkeleton />
      </ChartPanelSkeleton>
      <ChartPanelSkeleton value="runDeaths">
        <RunDeathReasonFrequencyChartSkeleton />
      </ChartPanelSkeleton>
      <ChartPanelSkeleton value="hardestWords">
        <HardestWordsLeaderboardChartSkeleton />
      </ChartPanelSkeleton>
    </Tabs.Root>
  );
}
