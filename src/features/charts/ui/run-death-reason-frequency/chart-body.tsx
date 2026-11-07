// services, features, and other libraries
import { useGT } from "gt-react";
import { Legend, PieChart, Pie, Sector } from "recharts";

// components
import { SectionHeader } from "@/ui/section-header";
import { ChartTooltip } from "@/features/charts/ui/chart-common";
import { CustomLegend } from "./custom-legend";

// types
import type { PieSectorShapeProps } from "recharts";
import type { RunDeathReasonFrequencyData } from "@/features/charts/domain/models";

// The row the two pies actually chart: the decoded fields they read, plus the human-readable reason their legend entries use
type ChartedRow = Pick<RunDeathReasonFrequencyData, "reason" | "personal" | "global"> & { readonly displayReason: string };

interface ChartBodyProps {
  // The decoded rows themselves, so the chart's payload type is derived from the
  // same schema the rows come from instead of a second hand-written copy of it
  runDeathReasonFrequency: ReadonlyArray<RunDeathReasonFrequencyData>;
  title: string;
  tooltipFormatter: (value: unknown, name: unknown) => readonly [string, string];
}

// constants
const COLORS_PERSONAL = { Forfeit: "var(--color-primary)", Guesses: "var(--color-accent)" } as const;
const COLORS_GLOBAL = { Forfeit: "var(--color-secondary)", Guesses: "var(--color-accent)" } as const;

// Recharts types the row behind a slice as `any`; narrow it to the row this chart passes in so the color is selected from a typed `reason`
const PieSlicePersonal = (props: PieSectorShapeProps) => <Sector {...props} fill={COLORS_PERSONAL[(props.payload as ChartedRow).reason]} />;
const PieSliceGlobal = (props: PieSectorShapeProps) => <Sector {...props} fill={COLORS_GLOBAL[(props.payload as ChartedRow).reason]} />;

// Only called with rows to plot: the empty case is a chart-wide concern and is resolved by the container, exactly as it is for the other five charts
export function ChartBody({ runDeathReasonFrequency, title, tooltipFormatter }: ChartBodyProps) {
  const gt = useGT();

  // Fields are picked out explicitly rather than spread over the decoded row:
  // these rows are schema-decoded class instances, and spreading one would
  // silently strip its prototype
  const chartData = runDeathReasonFrequency.map(({ reason, personal, global }): ChartedRow => ({
    reason,
    personal,
    global,
    displayReason: reason === "Forfeit" ? gt("Forfeit") : gt("Guesses"),
  }));

  return (
    <>
      <SectionHeader title={title} />
      <PieChart data={chartData} responsive className="mx-auto size-86 **:outline-none **:select-none lg:size-172">
        <ChartTooltip formatter={tooltipFormatter} />
        <Legend content={<CustomLegend />} />

        <Pie dataKey="personal" nameKey="displayReason" cx="50%" cy="50%" outerRadius="50%" stroke="var(--color-accent)" shape={PieSlicePersonal} label />
        <Pie
          dataKey="global"
          nameKey="displayReason"
          cx="50%"
          cy="50%"
          innerRadius="60%"
          outerRadius="80%"
          stroke="var(--color-accent)"
          shape={PieSliceGlobal}
          label
        />
      </PieChart>
    </>
  );
}
