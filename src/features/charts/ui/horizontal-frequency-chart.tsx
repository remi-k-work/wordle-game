// components
import { ChartGrid, ChartLegend, ChartTooltip, GlobalBar, PersonalBar } from "@/features/charts/ui/chart-common";
import { HorizontalBarFrame } from "@/features/charts/ui/horizontal-bar-shell";

// types
import type { LegendFormatter, TooltipFormatter, TooltipLabelFormatter } from "@/features/charts/ui/chart-series";
import type { ReactNode } from "react";

// Shared scaffolding for the horizontal frequency/leaderboard charts (opening guesses, missed words, hardest words)
interface HorizontalFrequencyChartProps {
  title: string;
  data: ReadonlyArray<unknown>;
  xAxis: ReactNode;
  yAxis: ReactNode;
  tooltipFormatter: TooltipFormatter;
  // Optional because recharts has its own label rendering, and two of the three charts here read the raw row label unchanged
  tooltipLabelFormatter?: TooltipLabelFormatter;
  legendFormatter: LegendFormatter;
  personalDataKey?: string;
  globalDataKey?: string;
}

export function HorizontalFrequencyChart({
  title,
  data,
  xAxis,
  yAxis,
  tooltipFormatter,
  tooltipLabelFormatter,
  legendFormatter,
  personalDataKey,
  globalDataKey,
}: HorizontalFrequencyChartProps) {
  return (
    <HorizontalBarFrame title={title} data={data}>
      <ChartGrid />
      {xAxis}
      {yAxis}
      <ChartTooltip formatter={tooltipFormatter} labelFormatter={tooltipLabelFormatter} />
      <ChartLegend formatter={legendFormatter} />
      <PersonalBar dataKey={personalDataKey} />
      <GlobalBar dataKey={globalDataKey} />
    </HorizontalBarFrame>
  );
}
