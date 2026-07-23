// services, features, and other libraries
import { cn } from "@/lib/utils";

// components
import { Tabs } from "@base-ui/react";
import { ChartTab, ChartTabSkeleton } from "@/ui/chart-tab";
import { ChartPanel, ChartPanelSkeleton } from "@/ui/chart-panel";
import { OpeningGuessesFrequencyChart, OpeningGuessesFrequencyChartSkeleton } from "./opening-guesses";
import { FailedWordsFrequencyChart, FailedWordsFrequencyChartSkeleton } from "./failed-words";
import { RunDeathReasonFrequencyChart, RunDeathReasonFrequencyChartSkeleton } from "./run-death-reason";

// types
import type { SolutionsLanguage } from "@/features/game/domain";

interface FrequencyChartsProps {
  solutionsLanguage: SolutionsLanguage;
}

export function FrequencyCharts({ solutionsLanguage }: FrequencyChartsProps) {
  return (
    <Tabs.Root className="my-8 w-full" defaultValue="firstWords">
      <Tabs.List className="relative z-1 -mb-px flex gap-1">
        <ChartTab value="firstWords">First Words</ChartTab>
        <ChartTab value="missedWords">Missed Words</ChartTab>
        <ChartTab value="runDeaths">Run Deaths</ChartTab>
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
    </Tabs.Root>
  );
}

export function FrequencyChartsSkeleton() {
  return (
    <Tabs.Root className="my-8 w-full" defaultValue="firstWords">
      <Tabs.List className="relative z-1 -mb-px flex gap-1">
        <ChartTabSkeleton value="firstWords" />
        <ChartTabSkeleton value="missedWords" />
        <ChartTabSkeleton value="runDeaths" />
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
    </Tabs.Root>
  );
}
