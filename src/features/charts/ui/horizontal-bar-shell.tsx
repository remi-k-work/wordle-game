// components
import { BarChart } from "recharts";
import { SectionHeader } from "@/ui/section-header";

// types
import type { ReactNode } from "react";

interface HorizontalBarFrameProps {
  title: string;
  data: ReadonlyArray<unknown>;
  children: ReactNode;
}

// constants
const HORIZONTAL_CHART_PADDING_PX = 96;
const HORIZONTAL_BAR_HEIGHT_PX = 48;

const horizontalChartHeight = (rowCount: number) => `${HORIZONTAL_CHART_PADDING_PX + rowCount * HORIZONTAL_BAR_HEIGHT_PX}px`;

// Shared SectionHeader + vertical BarChart wrapper for the horizontal frequency/leaderboard charts
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
