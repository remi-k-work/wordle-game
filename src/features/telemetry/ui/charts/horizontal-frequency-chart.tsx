// components
import { ChartGrid, ChartLegend, ChartTooltip, GlobalBar, PersonalBar } from "@/features/telemetry/ui/charts/chartCommon";
import { HorizontalBarFrame } from "@/features/telemetry/ui/charts/horizontal-bar-shell";

// types
import type { ReactNode } from "react";

// Shared scaffolding for the horizontal frequency/leaderboard charts
// (opening guesses, missed words, hardest words); each chart owns its data
// source, title, formatters, axis elements, and skeleton — this component only
// renders the frame + series chrome that is identical across charts: a grid,
// the axes, a personal/global tooltip & legend, and the personal + global bars
type TooltipFormatter = (value: unknown, name: unknown) => readonly [ReactNode, ReactNode];
type TooltipLabelFormatter = (label: unknown, payload?: unknown) => ReactNode;
type LegendFormatter = (value: unknown) => string;

interface HorizontalFrequencyChartProps {
  title: string;
  data: ReadonlyArray<unknown>;
  xAxis: ReactNode;
  yAxis: ReactNode;
  tooltipFormatter: TooltipFormatter;
  tooltipLabelFormatter: TooltipLabelFormatter;
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
