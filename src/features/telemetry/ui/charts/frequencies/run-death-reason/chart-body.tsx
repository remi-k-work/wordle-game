// react
import { useMemo } from "react";

// services, features, and other libraries
import { useGT } from "gt-next";
import { Legend, PieChart, Pie, Sector } from "recharts";

// components
import { SectionHeader } from "@/ui/section-header";
import { DistributionEmpty } from "@/features/telemetry/ui/charts/distribution-shell";
import { ChartTooltip } from "@/features/telemetry/ui/charts/chartCommon";
import { CustomLegend } from "./custom-legend";

// types
import type { PieSectorShapeProps } from "recharts";
import type { RunDeathReasonFrequencyData } from "@/features/telemetry/services/charts-db";

interface ChartBodyProps {
  runDeathReasonFrequency: ReadonlyArray<{ reason: "Forfeit" | "Guesses"; personal: number; global: number }>;
  title: string;
  emptyMessage: string;
  tooltipFormatter: (value: unknown, name: unknown) => readonly [string, string];
}

// constants
const COLORS_PERSONAL = { Forfeit: "var(--color-primary)", Guesses: "var(--color-accent)" } as const;
const COLORS_GLOBAL = { Forfeit: "var(--color-secondary)", Guesses: "var(--color-accent)" } as const;

const PieSlicePersonal = (props: PieSectorShapeProps) => <Sector {...props} fill={COLORS_PERSONAL[(props.payload as RunDeathReasonFrequencyData).reason]} />;
const PieSliceGlobal = (props: PieSectorShapeProps) => <Sector {...props} fill={COLORS_GLOBAL[(props.payload as RunDeathReasonFrequencyData).reason]} />;

export function ChartBody({ runDeathReasonFrequency, title, emptyMessage, tooltipFormatter }: ChartBodyProps) {
  const gt = useGT();
  const chartData = useMemo(
    () => runDeathReasonFrequency.map((run) => ({ ...run, displayReason: run.reason === "Forfeit" ? gt("Forfeit") : gt("Guesses") })),
    [runDeathReasonFrequency, gt]
  );

  if (runDeathReasonFrequency.length === 0) return <DistributionEmpty title={title} message={emptyMessage} />;

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
