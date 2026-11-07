// services, features, and other libraries
import { formatSeconds } from "@/domain/formatters";
import { makeSeriesLabels } from "@/features/charts/ui/chart-series";

// types
import type { useGT } from "gt-react";
import type { TooltipLabelFormatter } from "@/features/charts/ui/chart-series";
import type { TooltipPayloadEntry } from "recharts";
import type { HardestWordsLeaderboardData } from "@/features/charts/domain/models";

// Recharts types the row behind a tooltip entry as `any`; narrow it to the schema-decoded leaderboard row this chart actually passes in
type HardestWordsTooltipEntry = Omit<TooltipPayloadEntry, "payload"> & { readonly payload?: HardestWordsLeaderboardData };

// Resolves every formatter the hardest-words chart hands to recharts: the value axis ticks, the tooltip's value and heading labels, and the legend
export function makeHardestWordsSeriesLabels(gt: ReturnType<typeof useGT>) {
  const { tooltipFormatter, legendFormatter } = makeSeriesLabels({
    personalKey: "personalAvgTimeSeconds",
    personal: gt("Your Average Time"),
    global: gt("Global Average Time"),
    // Every entry on this chart is an average solve time in seconds
    formatValue: (value: unknown) => formatSeconds(Number(value)),
  });

  // The tooltip's heading row also reports both series' average guess counts
  // Those live on the row rather than on the series, so they are read from the
  // tooltip payload instead of from the value the formatter was handed
  const tooltipLabelFormatter: TooltipLabelFormatter = (label: unknown, payload?: unknown) => {
    const row = (payload as ReadonlyArray<HardestWordsTooltipEntry> | undefined)?.[0]?.payload;

    return (
      <>
        {label}
        <br />
        <span className="font-mono font-normal">{gt("Global Average Guesses: {count}", { count: row?.globalAvgGuesses.toFixed(1) ?? "—" })}</span>
        <br />
        <span className="font-mono font-normal">{gt("Your Average Guesses: {count}", { count: row?.personalAvgGuesses.toFixed(1) ?? "—" })}</span>
      </>
    );
  };

  return { tickFormatter: (value: number) => formatSeconds(value), tooltipFormatter, tooltipLabelFormatter, legendFormatter } as const;
}
