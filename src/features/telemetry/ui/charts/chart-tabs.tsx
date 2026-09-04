// services, features, and other libraries
import { cn } from "@/lib/utils";

// components
import { Tabs } from "@base-ui/react";
import { ChartTab, ChartTabSkeleton } from "@/ui/chart-tab";
import { ChartPanel, ChartPanelSkeleton } from "@/ui/chart-panel";

// types
import type { ReactNode } from "react";

interface ChartTabSpec {
  value: string;
  label: ReactNode;
  content: ReactNode;
}

// constants
const TABS_LIST_CLASSES = cn("relative z-1 -mb-px flex w-[100cqw] scrollbar-none gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden");
const TABS_INDICATOR_CLASSES = cn(
  "absolute top-0 left-0 -z-1 h-full w-(--active-tab-width) border-x border-t bg-surface-1",
  "translate-x-(--active-tab-left) transition-[translate,width] duration-300 ease-in-out"
);

// Shared Tabs chrome for DistributionCharts/FrequencyCharts. Tab specs stay
// declarative at call sites; only list/indicator/panel scaffolding is shared.
export function ChartTabs({ defaultValue, tabs }: { defaultValue: string; tabs: ReadonlyArray<ChartTabSpec> }) {
  return (
    <Tabs.Root className="@container my-8 w-full" defaultValue={defaultValue}>
      <Tabs.List className={TABS_LIST_CLASSES}>
        {tabs.map(({ value, label }) => (
          <ChartTab key={value} value={value}>
            {label}
          </ChartTab>
        ))}
        <Tabs.Indicator className={TABS_INDICATOR_CLASSES} />
      </Tabs.List>
      {tabs.map(({ value, content }) => (
        <ChartPanel key={value} value={value}>
          {content}
        </ChartPanel>
      ))}
    </Tabs.Root>
  );
}

export function ChartTabsSkeleton({ defaultValue, tabs }: { defaultValue: string; tabs: ReadonlyArray<{ value: string; skeleton: ReactNode }> }) {
  return (
    <Tabs.Root className="@container my-8 w-full" defaultValue={defaultValue}>
      <Tabs.List className={TABS_LIST_CLASSES}>
        {tabs.map(({ value }) => (
          <ChartTabSkeleton key={value} value={value} />
        ))}
        <Tabs.Indicator className={TABS_INDICATOR_CLASSES} />
      </Tabs.List>
      {tabs.map(({ value, skeleton }) => (
        <ChartPanelSkeleton key={value} value={value}>
          {skeleton}
        </ChartPanelSkeleton>
      ))}
    </Tabs.Root>
  );
}
