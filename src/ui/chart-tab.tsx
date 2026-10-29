// services, features, and other libraries
import { cn } from "@/lib/utils";

// components
import { Tabs } from "@base-ui/react/tabs";

// types
import type { ReactNode } from "react";

interface ChartTabProps {
  value: Tabs.Tab.Value;
  children: ReactNode;
}

// constants
// Fully static class string, hoisted so tab switches don't re-run it through
// twMerge; shared by the tab and its skeleton
const TAB_CLASS = cn(
  "flex items-center justify-center px-6 py-4 text-lg font-semibold tracking-widest break-keep whitespace-nowrap text-text-2 uppercase outline-none select-none",
  "hover:text-text-2",
  "focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-accent focus-visible:outline-solid",
  "data-active:text-primary"
);

export function ChartTab({ value, children }: ChartTabProps) {
  return (
    <Tabs.Tab className={TAB_CLASS} value={value}>
      {children}
    </Tabs.Tab>
  );
}

export function ChartTabSkeleton({ value }: Pick<ChartTabProps, "value">) {
  return (
    <Tabs.Tab className={TAB_CLASS} value={value} disabled>
      <div className="h-6 w-full animate-pulse bg-accent" />
    </Tabs.Tab>
  );
}
