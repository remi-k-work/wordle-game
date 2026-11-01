// services, features, and other libraries
import { CartesianGrid, Legend, Tooltip, Bar, Line } from "recharts";

// types
import type { ComponentPropsWithoutRef } from "react";

type TooltipProps = ComponentPropsWithoutRef<typeof Tooltip>;
type LegendProps = ComponentPropsWithoutRef<typeof Legend>;

// Shared styling for the telemetry charts. Centralising these ensures the
// tooltip/legend/grid/bar styling stays consistent across every chart and
// avoids repeating the same declarative config in each chart component
const tooltipStyle = {
  contentStyle: { backgroundColor: "var(--color-surface-1)" },
  labelStyle: { fontFamily: "var(--font-sans)", fontWeight: "bold", color: "var(--color-text-1)" },
  itemStyle: { color: "var(--color-text-2)" },
} as const;

// Hoisted alongside tooltipStyle so every render passes stable prop identities
// instead of freshly-allocated object/array literals (rerender-memo-with-default-value)
const tooltipCursor = { fill: "var(--color-surface-2)" } as const;
const legendLabelStyle = { fontFamily: "var(--font-sans)", color: "var(--color-text-2)" } as const;
const RADIUS_TOP: [number, number, number, number] = [9, 9, 0, 0];
const RADIUS_RIGHT: [number, number, number, number] = [0, 9, 9, 0];

export function ChartTooltip(props: TooltipProps) {
  return <Tooltip cursor={tooltipCursor} {...tooltipStyle} {...props} />;
}

export function ChartLegend({ formatter }: Pick<LegendProps, "formatter">) {
  return <Legend formatter={formatter} labelStyle={legendLabelStyle} />;
}

export function ChartGrid() {
  return <CartesianGrid stroke="var(--color-surface-3)" />;
}

// The personal/global bars used by the distribution-style (composed) charts
export function PersonalPctBar() {
  return <Bar dataKey="personalPct" stroke="var(--color-accent)" fill="var(--color-primary)" radius={RADIUS_TOP} />;
}

export function GlobalPctLine() {
  return <Line type="monotone" dataKey="globalPct" stroke="var(--color-secondary)" strokeWidth={4} />;
}

// The personal/global bars used by the horizontal frequency/leaderboard charts
export function PersonalBar({ dataKey = "personal" }: { dataKey?: string }) {
  return <Bar dataKey={dataKey} stroke="var(--color-accent)" fill="var(--color-primary)" radius={RADIUS_RIGHT} />;
}

export function GlobalBar({ dataKey = "global" }: { dataKey?: string }) {
  return <Bar dataKey={dataKey} stroke="var(--color-accent)" fill="var(--color-secondary)" radius={RADIUS_RIGHT} />;
}
