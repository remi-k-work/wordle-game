// components
import { ChartGrid, ChartLegend, ChartTooltip, GlobalPctLine, PersonalPctBar } from "@/features/charts/ui/chart-common";
import { DistributionFrame } from "@/features/charts/ui/distribution-shell";

// types
import type { LegendFormatter, TooltipFormatter, TooltipLabelFormatter } from "@/features/charts/ui/chart-series";
import type { ReactNode } from "react";

// Shared scaffolding for the distribution charts (guesses to win, time to solve, arcade streak)
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
