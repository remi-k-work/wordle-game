// components
import { ComposedChart } from "recharts";
import { InfoLine } from "@/ui/info-line";
import { SectionHeader, SectionHeaderSkeleton } from "@/ui/section-header";

// types
import type { ReactNode } from "react";

interface DistributionFrameProps {
  title: string;
  data: ReadonlyArray<unknown>;
  children: ReactNode;
}

// constants
const DISTRIBUTION_CHART_CLASS = "h-96 w-full **:outline-none **:select-none lg:h-192";

// Shared SectionHeader + ComposedChart wrapper for the three distribution
// charts (guesses, time-to-solve, streak). Axis/Tooltip/Legend/series stay in
// each chart because labels and formatters differ.
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

export function DistributionEmpty({ title, message }: { title: string; message: string }) {
  return (
    <>
      <SectionHeader title={title} />
      <InfoLine message={message} />
    </>
  );
}

export function DistributionSkeleton({ title }: { title: string }) {
  return (
    <>
      <SectionHeaderSkeleton title={title} />
      <div className="h-96 w-full lg:h-192" />
    </>
  );
}
