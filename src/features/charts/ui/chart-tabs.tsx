// services, features, and other libraries
import { cn } from "@/lib/utils";

// components
import { Tabs } from "@base-ui/react/tabs";
import { ChartTab, ChartTabSkeleton } from "@/ui/chart-tab";
import { ChartPanel } from "@/ui/chart-panel";

// types
import type { ReactNode } from "react";

interface ChartTabSpec {
  value: string;
  label: ReactNode;
  // Only the active tab's element is mounted, so chart data hooks remain lazy
  content: ReactNode;
}

// constants
const TABS_LIST_CLASSES = cn("relative z-1 -mb-px flex w-[100cqw] scrollbar-none gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden");
const TABS_INDICATOR_CLASSES = cn(
  "absolute top-0 left-0 -z-1 h-full w-(--active-tab-width) border-x border-t bg-surface-1",
  "translate-x-(--active-tab-left) transition-[translate,width] duration-300 ease-in-out"
);
const TABS_ROOT_CLASSES = cn("@container my-8 w-full");

// The tab list and its sliding indicator are the same in the live tabs and in
// their skeleton — only the element rendered for each tab differs, so the
// caller maps its tabs into this scaffold instead of restating it
function ChartTabsList({ children }: { children: ReactNode }) {
  return (
    <Tabs.List className={TABS_LIST_CLASSES}>
      {children}
      <Tabs.Indicator className={TABS_INDICATOR_CLASSES} />
    </Tabs.List>
  );
}

// Shared Tabs chrome for DistributionCharts/FrequencyCharts. Tab specs stay
// declarative at call sites; only list/indicator/panel scaffolding is shared.
// The root is deliberately uncontrolled: `Tabs` owns which tab is selected and
// only mounts the panel for it (base-ui unmounts inactive panels by default),
// so chart data hooks stay lazy without `ChartTabs` having to hold, thread,
// and re-derive the selection itself
export function ChartTabs({ defaultValue, tabs }: { defaultValue: string; tabs: ReadonlyArray<ChartTabSpec> }) {
  return (
    <Tabs.Root className={TABS_ROOT_CLASSES} defaultValue={defaultValue}>
      <ChartTabsList>
        {tabs.map(({ value, label }) => (
          <ChartTab key={value} value={value}>
            {label}
          </ChartTab>
        ))}
      </ChartTabsList>
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
    <Tabs.Root className={TABS_ROOT_CLASSES} defaultValue={defaultValue}>
      <ChartTabsList>
        {tabs.map(({ value }) => (
          <ChartTabSkeleton key={value} value={value} />
        ))}
      </ChartTabsList>
      {tabs.map(({ value, skeleton }) => (
        <ChartPanel key={value} value={value}>
          {skeleton}
        </ChartPanel>
      ))}
    </Tabs.Root>
  );
}
