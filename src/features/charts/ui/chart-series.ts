// types
import type { ReactNode } from "react";

// The formatters recharts asks a chart for; every chart in this feature maps raw values through the same trio
export type TooltipFormatter = (value: unknown, name: unknown) => readonly [ReactNode, ReactNode];
export type TooltipLabelFormatter = (label: unknown, payload?: unknown) => ReactNode;
export type LegendFormatter = (value: unknown) => string;

interface SeriesLabels {
  // Data key of the highlighted series. Recharts hands the formatters the series
  // key as their `name` argument, and every other series is the global one
  personalKey: string;
  // Already-translated copy for the two series; callers use literal gt(...)
  // calls so the CLI can extract the source strings for translation
  personal: string;
  global: string;
  // How a raw entry is rendered, e.g. with the distribution charts' `%` suffix
  formatValue: (value: unknown) => string;
}

// Raw counts, the way the frequency/leaderboard charts render an entry
export const formatCount = (value: unknown) => String(value);

// Percentages, the way the distribution charts render an entry
export const formatPercent = (value: unknown) => `${String(value)}%`;

// Resolves the tooltip and legend formatters for a chart that plots one personal series against one global series
export function makeSeriesLabels({ personalKey, personal, global, formatValue }: SeriesLabels) {
  const labelFor = (name: unknown) => (name === personalKey ? personal : global);

  return { tooltipFormatter: (value: unknown, name: unknown) => [formatValue(value), labelFor(name)] as const, legendFormatter: labelFor } as const;
}
