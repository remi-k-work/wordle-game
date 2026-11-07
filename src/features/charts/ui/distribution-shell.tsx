// services, features, and other libraries
import { cn } from "@/lib/utils";

// components
import { ComposedChart } from "recharts";
import { SectionHeader } from "@/ui/section-header";

// types
import type { ReactNode } from "react";

interface DistributionFrameProps {
  title: string;
  data: ReadonlyArray<unknown>;
  children: ReactNode;
}

// constants
const DISTRIBUTION_CHART_CLASS = cn("h-96 w-full **:outline-none **:select-none lg:h-192");

// Shared SectionHeader + ComposedChart wrapper for the three distribution charts (guesses, time-to-solve, streak)
export function DistributionFrame({ title, data, children }: DistributionFrameProps) {
  return (
    <>
      <SectionHeader title={title} />
      <ComposedChart data={data} responsive className={DISTRIBUTION_CHART_CLASS}>
        {children}
      </ComposedChart>
    </>
  );
}
