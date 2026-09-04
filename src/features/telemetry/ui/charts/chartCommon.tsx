// services, features, and other libraries
import { CartesianGrid, Legend, Tooltip, Bar, Line } from "recharts";

// types
import type { ComponentProps } from "react";

type TooltipProps = ComponentProps<typeof Tooltip>;
type LegendProps = ComponentProps<typeof Legend>;

// Shared styling for the telemetry charts. Centralising these ensures the
// tooltip/legend/grid/bar styling stays consistent across every chart and
// avoids repeating the same declarative config in each chart component.
const tooltipStyle = {
  contentStyle: { backgroundColor: "var(--color-surface-1)" },
  labelStyle: { fontFamily: "var(--font-sans)", fontWeight: "bold", color: "var(--color-text-1)" },
  itemStyle: { color: "var(--color-text-2)" },
} as const;

export function ChartTooltip(props: TooltipProps) {
  return <Tooltip cursor={{ fill: "var(--color-surface-2)" }} {...tooltipStyle} {...props} />;
}

export function ChartLegend({ formatter }: Pick<LegendProps, "formatter">) {
  return <Legend formatter={formatter} labelStyle={{ fontFamily: "var(--font-sans)", color: "var(--color-text-2)" }} />;
}

export function ChartGrid() {
  return <CartesianGrid stroke="var(--color-surface-3)" />;
}

// The personal/global bars used by the distribution-style (composed) charts.
export function PersonalPctBar() {
  return <Bar dataKey="personalPct" stroke="var(--color-accent)" fill="var(--color-primary)" radius={[9, 9, 0, 0]} />;
}

export function GlobalPctLine() {
  return <Line type="monotone" dataKey="globalPct" stroke="var(--color-secondary)" strokeWidth={4} />;
}

// The personal/global bars used by the horizontal frequency/leaderboard charts.
export function PersonalBar({ dataKey = "personal" }: { dataKey?: string }) {
  return <Bar dataKey={dataKey} stroke="var(--color-accent)" fill="var(--color-primary)" radius={[0, 9, 9, 0]} />;
}

export function GlobalBar({ dataKey = "global" }: { dataKey?: string }) {
  return <Bar dataKey={dataKey} stroke="var(--color-accent)" fill="var(--color-secondary)" radius={[0, 9, 9, 0]} />;
}
