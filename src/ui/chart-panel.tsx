// services, features, and other libraries
import { cn } from "@/lib/utils";

// components
import { Tabs } from "@base-ui/react/tabs";

// types
import type { ReactNode } from "react";

interface ChartPanelProps {
  value: Tabs.Tab.Value;
  children: ReactNode;
}

// constants
const PANEL_CLASS = cn(
  "w-full border p-3 outline-none",
  "focus-visible:accent focus-visible:z-1 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-solid",
  "[[hidden]]:hidden"
);

// The panel is pure chrome around whatever it wraps, so the tab skeleton wraps
// its placeholder content in this same panel rather than needing a separate
// skeleton variant that would render identical markup
export function ChartPanel({ value, children }: ChartPanelProps) {
  return (
    <Tabs.Panel className={PANEL_CLASS} value={value}>
      {children}
    </Tabs.Panel>
  );
}
