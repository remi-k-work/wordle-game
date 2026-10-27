// components
import { ChartGrid, ChartLegend, ChartTooltip, GlobalPctLine, PersonalPctBar } from "@/features/telemetry/ui/charts/chartCommon";
import { DistributionFrame } from "@/features/telemetry/ui/charts/distribution-shell";

// types
import type { ReactNode } from "react";

// Shared scaffolding for the distribution charts (guesses to win, time to solve,
// arcade streak); each chart owns its data source, title, formatters, axis
// element, and skeleton — this component only renders the frame + series chrome
// that is identical across charts: a grid, the x-axis, a personal/global
// tooltip & legend, and the personal % bar + global % line
type TooltipFormatter = (value: unknown, name: unknown) => readonly [ReactNode, ReactNode];
type TooltipLabelFormatter = (label: unknown, payload?: unknown) => ReactNode;
type LegendFormatter = (value: unknown) => string;

interface DistributionChartProps {
  title: string;
  data: ReadonlyArray<unknown>;
  xAxis: ReactNode;
  tooltipFormatter: TooltipFormatter;
  tooltipLabelFormatter: TooltipLabelFormatter;
  legendFormatter: LegendFormatter;
}

export function DistributionChart({ title, data, xAxis, tooltipFormatter, tooltipLabelFormatter, legendFormatter }: DistributionChartProps) {
  return (
    <DistributionFrame title={title} data={data}>
      <ChartGrid />
      {xAxis}
      <ChartTooltip formatter={tooltipFormatter} labelFormatter={tooltipLabelFormatter} />
      <ChartLegend formatter={legendFormatter} />
      <PersonalPctBar />
      <GlobalPctLine />
    </DistributionFrame>
  );
}
