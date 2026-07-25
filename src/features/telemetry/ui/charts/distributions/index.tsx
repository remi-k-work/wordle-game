// services, features, and other libraries
import { cn } from "@/lib/utils";

// components
import { Tabs } from "@base-ui/react";
import { ChartTab, ChartTabSkeleton } from "@/ui/chart-tab";
import { ChartPanel, ChartPanelSkeleton } from "@/ui/chart-panel";
import { GuessDistributionChart, GuessDistributionChartSkeleton } from "./guess";
import { TimeToSolveDistributionChart, TimeToSolveDistributionChartSkeleton } from "./time-to-solve";
import { ArcadeStreakDistributionChart, ArcadeStreakDistributionChartSkeleton } from "./arcade-streak";

// types
import type { SolutionsLanguage } from "@/features/game/domain";

interface DistributionChartsProps {
  solutionsLanguage: SolutionsLanguage;
}

export function DistributionCharts({ solutionsLanguage }: DistributionChartsProps) {
  return (
    <Tabs.Root className="@container my-8 w-full" defaultValue="guesses">
      <Tabs.List className="relative z-1 -mb-px flex w-[100cqw] scrollbar-none gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden">
        <ChartTab value="guesses">Guesses to Win</ChartTab>
        <ChartTab value="time">Time to Solve</ChartTab>
        <ChartTab value="streak">Streak</ChartTab>
        <Tabs.Indicator
          className={cn(
            "absolute top-0 left-0 -z-1 h-full w-(--active-tab-width) border-x border-t bg-surface-1",
            "translate-x-(--active-tab-left) transition-[translate,width] duration-300 ease-in-out"
          )}
        />
      </Tabs.List>
      <ChartPanel value="guesses">
        <GuessDistributionChart solutionsLanguage={solutionsLanguage} />
      </ChartPanel>
      <ChartPanel value="time">
        <TimeToSolveDistributionChart solutionsLanguage={solutionsLanguage} />
      </ChartPanel>
      <ChartPanel value="streak">
        <ArcadeStreakDistributionChart solutionsLanguage={solutionsLanguage} />
      </ChartPanel>
    </Tabs.Root>
  );
}

export function DistributionChartsSkeleton() {
  return (
    <Tabs.Root className="@container my-8 w-full" defaultValue="guesses">
      <Tabs.List className="relative z-1 -mb-px flex w-[100cqw] scrollbar-none gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden">
        <ChartTabSkeleton value="guesses" />
        <ChartTabSkeleton value="time" />
        <ChartTabSkeleton value="streak" />
        <Tabs.Indicator
          className={cn(
            "absolute top-0 left-0 -z-1 h-full w-(--active-tab-width) border-x border-t bg-surface-1",
            "translate-x-(--active-tab-left) transition-[translate,width] duration-300 ease-in-out"
          )}
        />
      </Tabs.List>
      <ChartPanelSkeleton value="guesses">
        <GuessDistributionChartSkeleton />
      </ChartPanelSkeleton>
      <ChartPanelSkeleton value="time">
        <TimeToSolveDistributionChartSkeleton />
      </ChartPanelSkeleton>
      <ChartPanelSkeleton value="streak">
        <ArcadeStreakDistributionChartSkeleton />
      </ChartPanelSkeleton>
    </Tabs.Root>
  );
}
