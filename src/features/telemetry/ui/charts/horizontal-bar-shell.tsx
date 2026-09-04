// components
import { BarChart } from "recharts";
import { InfoLine } from "@/ui/info-line";
import { SectionHeader, SectionHeaderSkeleton } from "@/ui/section-header";

// types
import type { ReactNode } from "react";

// constants
export const HORIZONTAL_CHART_PADDING_PX = 96;
export const HORIZONTAL_BAR_HEIGHT_PX = 48;

export function horizontalChartHeight(rowCount: number): string {
  return `${HORIZONTAL_CHART_PADDING_PX + rowCount * HORIZONTAL_BAR_HEIGHT_PX}px`;
}

interface HorizontalBarFrameProps {
  title: string;
  data: ReadonlyArray<unknown>;
  children: ReactNode;
}

// Shared SectionHeader + vertical BarChart wrapper for the horizontal
// frequency/leaderboard charts. Series and formatters stay per-chart.
export function HorizontalBarFrame({ title, data, children }: HorizontalBarFrameProps) {
  return (
    <>
      <SectionHeader title={title} />
      <BarChart
        data={data}
        responsive
        layout="vertical"
        className="w-full **:outline-none **:select-none"
        style={{ height: horizontalChartHeight(data.length) }}
      >
        {children}
      </BarChart>
    </>
  );
}

export function HorizontalBarEmpty({ title, message }: { title: string; message: string }) {
  return (
    <>
      <SectionHeader title={title} />
      <InfoLine message={message} />
    </>
  );
}

export function HorizontalBarSkeleton({ title }: { title: string }) {
  return (
    <>
      <SectionHeaderSkeleton title={title} />
      <div className="h-96 w-full lg:h-192" />
    </>
  );
}
