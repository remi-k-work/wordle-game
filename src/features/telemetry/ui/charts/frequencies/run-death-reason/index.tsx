// react
import { useCallback, useMemo } from "react";

// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { AsyncResult } from "effect/unstable/reactivity";
import { T, useGT } from "gt-next";
import { runDeathReasonFrequencyAtom } from "@/features/telemetry/state";
import { Legend, PieChart, Pie, Sector } from "recharts";

// components
import { SectionHeader, SectionHeaderSkeleton } from "@/ui/section-header";
import { DistributionEmpty } from "@/features/telemetry/ui/charts/distribution-shell";
import { ChartTooltip } from "@/features/telemetry/ui/charts/chartCommon";

// types
import type { SolutionsLanguage } from "@/features/game/domain";
import type { PieSectorShapeProps } from "recharts";
import type { RunDeathReasonFrequencyData } from "@/features/telemetry/services/charts-db";

interface RunDeathReasonFrequencyChartProps {
  solutionsLanguage: SolutionsLanguage;
}

// constants
const COLORS_PERSONAL = { Forfeit: "var(--color-primary)", Guesses: "var(--color-accent)" } as const;
const COLORS_GLOBAL = { Forfeit: "var(--color-secondary)", Guesses: "var(--color-accent)" } as const;

const PieSlicePersonal = (props: PieSectorShapeProps) => <Sector {...props} fill={COLORS_PERSONAL[(props.payload as RunDeathReasonFrequencyData).reason]} />;
const PieSliceGlobal = (props: PieSectorShapeProps) => <Sector {...props} fill={COLORS_GLOBAL[(props.payload as RunDeathReasonFrequencyData).reason]} />;

const CustomLegend = () => (
  <div className="flex flex-col items-center font-sans text-text-2">
    <div className="flex items-center gap-2">
      <div className="size-4 bg-(--color-primary)" />
      <T>Your Runs (Inner)</T>
    </div>
    <div className="flex items-center gap-2">
      <div className="size-4 bg-(--color-secondary)" />
      <T>Global Base (Outer)</T>
    </div>
  </div>
);

export function RunDeathReasonFrequencyChart({ solutionsLanguage }: RunDeathReasonFrequencyChartProps) {
  const runDeathReasonFrequency = useAtomValue(runDeathReasonFrequencyAtom(solutionsLanguage));
  const gt = useGT();

  const tooltipFormatter = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (value: any, name: any) => [gt("{count} times", { count: value }), name ?? ""] as const,
    [gt]
  );

  return AsyncResult.builder(runDeathReasonFrequency)
    .onInitialOrWaiting(() => <RunDeathReasonFrequencyChartSkeleton />)
    .onFailure(() => <RunDeathReasonFrequencyChartSkeleton />)
    .onSuccess((runDeathReasonFrequency) => (
      <RunDeathReasonChartBody
        runDeathReasonFrequency={runDeathReasonFrequency}
        tooltipFormatter={tooltipFormatter}
        title={gt("Reasons why an arcade run ended")}
        emptyMessage={gt("No frequency data tracked yet!")}
      />
    ))
    .render();
}

function RunDeathReasonChartBody({
  runDeathReasonFrequency,
  tooltipFormatter,
  title,
  emptyMessage,
}: {
  runDeathReasonFrequency: ReadonlyArray<{ reason: "Forfeit" | "Guesses"; personal: number; global: number }>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tooltipFormatter: (value: any, name: any) => readonly [string, string];
  title: string;
  emptyMessage: string;
}) {
  const gt = useGT();
  const chartData = useMemo(
    () =>
      runDeathReasonFrequency.map((run) => ({
        ...run,
        displayReason: run.reason === "Forfeit" ? gt("Forfeit") : gt("Guesses"),
      })),
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

export function RunDeathReasonFrequencyChartSkeleton() {
  const gt = useGT();

  return (
    <>
      <SectionHeaderSkeleton title={gt("Reasons why an arcade run ended")} />
      <div className="mx-auto size-86 w-full lg:size-172" />
    </>
  );
}
