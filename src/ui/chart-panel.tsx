// services, features, and other libraries
import { cn } from "@/lib/utils";

// components
import { Tabs } from "@base-ui/react";

// types
import type { ReactNode } from "react";

interface ChartPanelProps {
  value: Tabs.Tab.Value;
  children: ReactNode;
}

export function ChartPanel({ value, children }: ChartPanelProps) {
  return (
    <Tabs.Panel
      className={cn(
        "w-full border p-3 outline-none",
        "focus-visible:accent focus-visible:z-1 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-solid",
        "[[hidden]]:hidden"
      )}
      value={value}
    >
      {children}
    </Tabs.Panel>
  );
}

export function ChartPanelSkeleton({ value, children }: ChartPanelProps) {
  return (
    <Tabs.Panel
      className={cn(
        "w-full border p-3 outline-none",
        "focus-visible:accent focus-visible:z-1 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-solid",
        "[[hidden]]:hidden"
      )}
      value={value}
    >
      {children}
    </Tabs.Panel>
  );
}
