// services, features, and other libraries
import { cn } from "@/lib/utils";

// components
import { Tabs } from "@base-ui/react";

// types
import type { ReactNode } from "react";

interface ChartTabProps {
  value: Tabs.Tab.Value;
  children: ReactNode;
}

export function ChartTab({ value, children }: ChartTabProps) {
  return (
    <Tabs.Tab
      className={cn(
        "flex items-center justify-center px-2 py-2 font-semibold tracking-tight text-text-2 uppercase",
        "sm:px-6 sm:py-4 sm:text-lg sm:tracking-widest",
        "break-keep whitespace-nowrap outline-none select-none",
        "hover:text-text-2",
        "focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-accent focus-visible:outline-solid",
        "data-active:text-primary"
      )}
      value={value}
    >
      {children}
    </Tabs.Tab>
  );
}

export function ChartTabSkeleton({ value }: Pick<ChartTabProps, "value">) {
  return (
    <Tabs.Tab
      className={cn(
        "flex items-center justify-center px-2 py-2 font-semibold tracking-tight text-text-2 uppercase",
        "sm:px-6 sm:py-4 sm:text-lg sm:tracking-widest",
        "break-keep whitespace-nowrap outline-none select-none",
        "hover:text-text-2",
        "focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-accent focus-visible:outline-solid",
        "data-active:text-primary"
      )}
      value={value}
      disabled
    >
      <div className="h-6 w-full animate-pulse bg-accent" />
    </Tabs.Tab>
  );
}
