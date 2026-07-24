// services, features, and other libraries
import { Duration } from "effect";
import { useAtomValue } from "@effect/atom-react";
import { AsyncResult } from "effect/unstable/reactivity";
import { anyAvgStatAtom } from "@/features/telemetry/state";
import { formatDuration } from "@/features/game/domain";

// components
import { InfoLine } from "@/ui/info-line";
import { SectionHeader } from "@/ui/section-header";

// types
import type { SolutionsLanguage } from "@/features/game/domain";
import type { AnyAvgStatArgs } from "@/features/telemetry/services/charts-db";

interface AnyAvgStatChartProps {
  statColumn: AnyAvgStatArgs["statColumn"];
  statTable: AnyAvgStatArgs["statTable"];
  solutionsLanguage: SolutionsLanguage;
  title: string;
  personalHeader: string;
}

export function AnyAvgStatChart({ statColumn, statTable, solutionsLanguage, title, personalHeader }: AnyAvgStatChartProps) {
  const anyAvgStat = useAtomValue(anyAvgStatAtom({ statColumn, statTable, solutionsLanguage }));

  return AsyncResult.builder(anyAvgStat)
    .onInitialOrWaiting(() => <AnyAvgStatChartSkeleton title={title} personalHeader={personalHeader} />)
    .onFailure(() => <AnyAvgStatChartSkeleton title={title} personalHeader={personalHeader} />)
    .onSuccess((anyAvgStat) =>
      anyAvgStat.length === 0 ? (
        <>
          <SectionHeader title={title} />
          <InfoLine message="No stats data tracked yet!" />
        </>
      ) : (
        <>
          <SectionHeader title={title} />
          <article className="grid grid-cols-2 gap-6">
            <header className="grid aspect-auto w-3/4 max-w-sm gap-3 justify-self-center rounded-xl border-2 border-primary bg-(--color-surface-1) p-3 text-center md:aspect-square md:p-6 lg:p-9">
              <h3 className="font-semibold tracking-widest text-(--color-primary) uppercase sm:text-xl md:text-2xl lg:text-3xl">{personalHeader}</h3>
              <span className="text-4xl font-semibold wrap-anywhere text-(--color-primary) sm:text-5xl md:text-6xl lg:text-7xl">
                {statColumn === "timeSeconds" || statColumn === "durationSeconds"
                  ? formatDuration(Duration.seconds(anyAvgStat[0].personal))
                  : anyAvgStat[0].personal.toLocaleString()}
              </span>
            </header>

            <footer className="grid aspect-auto w-3/4 max-w-sm gap-3 justify-self-center rounded-xl border-2 border-secondary bg-(--color-surface-1) p-3 text-center md:aspect-square md:p-6 lg:p-9">
              <h3 className="font-semibold tracking-widest text-(--color-secondary) uppercase sm:text-xl md:text-2xl lg:text-3xl">Global Average</h3>
              <span className="text-4xl font-semibold wrap-anywhere text-(--color-secondary) sm:text-5xl md:text-6xl lg:text-7xl">
                {statColumn === "timeSeconds" || statColumn === "durationSeconds"
                  ? formatDuration(Duration.seconds(anyAvgStat[0].global))
                  : anyAvgStat[0].global.toLocaleString()}
              </span>
            </footer>
          </article>
        </>
      )
    )
    .render();
}

export function AnyAvgStatChartSkeleton({ title, personalHeader }: Pick<AnyAvgStatChartProps, "title" | "personalHeader">) {
  return (
    <>
      <SectionHeader title={title} />
      <article className="grid grid-cols-2 gap-6">
        <header className="grid aspect-auto w-3/4 max-w-sm gap-3 justify-self-center rounded-xl border-2 border-primary bg-(--color-surface-1) p-3 text-center md:aspect-square md:p-6 lg:p-9">
          <h3 className="font-semibold tracking-widest text-(--color-primary) uppercase sm:text-xl md:text-2xl lg:text-3xl">{personalHeader}</h3>
          <span className="animate-pulse bg-accent text-4xl font-semibold wrap-anywhere text-(--color-primary) sm:text-5xl md:text-6xl lg:text-7xl">
            &nbsp;
          </span>
        </header>

        <footer className="grid aspect-auto w-3/4 max-w-sm gap-3 justify-self-center rounded-xl border-2 border-secondary bg-(--color-surface-1) p-3 text-center md:aspect-square md:p-6 lg:p-9">
          <h3 className="font-semibold tracking-widest text-(--color-secondary) uppercase sm:text-xl md:text-2xl lg:text-3xl">Global Average</h3>
          <span className="animate-pulse bg-accent text-4xl font-semibold wrap-anywhere text-(--color-secondary) sm:text-5xl md:text-6xl lg:text-7xl">
            &nbsp;
          </span>
        </footer>
      </article>
    </>
  );
}
