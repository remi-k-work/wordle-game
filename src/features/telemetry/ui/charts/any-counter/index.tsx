// react
import { useEffect } from "react";

// services, features, and other libraries
import { useAtom } from "@effect/atom-react";
import { AsyncResult } from "effect/unstable/reactivity";
import { getAnyCountersAction } from "@/features/telemetry/state";

// components
import { InfoLine } from "@/ui/shared/info-line";
import { SectionHeader } from "@/ui/section-header";

// assets
import { PlFlagIcon, UsFlagIcon } from "@/assets/icons";

// types
import type { SolutionsLanguage } from "@/features/game/domain";

interface AnyCounterChartProps {
  counterName: string;
  solutionsLanguage: SolutionsLanguage;
  personalHeader: string;
}

interface AnyCounterChartsProps {
  title: string;
  counterName: string;
  personalHeader: string;
}

function AnyCounterChart({ counterName, solutionsLanguage, personalHeader }: AnyCounterChartProps) {
  const [getAnyCountersResult, getAnyCounters] = useAtom(getAnyCountersAction(counterName));

  useEffect(() => {
    getAnyCounters();
  }, [getAnyCounters]);

  return AsyncResult.builder(getAnyCountersResult)
    .onInitialOrWaiting(() => null)
    .onFailure(() => null)
    .onSuccess((anyCountersData) => {
      const anyCounterData = anyCountersData[solutionsLanguage === "En" ? 0 : 1];

      return anyCounterData.length === 0 ? (
        <InfoLine message="No counter data tracked yet!" />
      ) : (
        <article className="grid grid-cols-2 gap-6">
          <header className="grid w-3/4 max-w-sm gap-3 justify-self-center rounded-xl bg-(--color-surface-2) p-6 text-center shadow-sm ring-1 ring-(--color-accent)">
            <h3 className="font-sans tracking-widest text-(--color-text-2)">{personalHeader}</h3>
            <span className="text-4xl font-semibold wrap-anywhere text-(--color-primary)">{anyCounterData[0].personal.toLocaleString()}</span>
          </header>

          <footer className="grid w-3/4 max-w-sm gap-3 justify-self-center rounded-xl bg-(--color-surface-2) p-6 text-center shadow-sm ring-1 ring-(--color-accent)">
            <h3 className="font-sans tracking-widest text-(--color-text-2)">Global Total</h3>
            <span className="text-4xl font-semibold wrap-anywhere text-(--color-secondary)">{anyCounterData[0].global.toLocaleString()}</span>
          </footer>
        </article>
      );
    })
    .render();
}

export function AnyCounterCharts({ title, counterName, personalHeader }: AnyCounterChartsProps) {
  return (
    <section className="grid gap-3 xl:grid-cols-2">
      <div>
        <SectionHeader
          title={
            <span className="flex items-center justify-between gap-3">
              {title}
              <UsFlagIcon className="size-11 shrink-0" />
            </span>
          }
        />
        <AnyCounterChart counterName={counterName} solutionsLanguage="En" personalHeader={personalHeader} />
      </div>
      <div>
        <SectionHeader
          title={
            <span className="flex items-center justify-between gap-3">
              {title}
              <PlFlagIcon className="size-11 shrink-0" />
            </span>
          }
        />
        <AnyCounterChart counterName={counterName} solutionsLanguage="Pl" personalHeader={personalHeader} />
      </div>
    </section>
  );
}

export function AnyCounterChartsSkeleton({ title }: Pick<AnyCounterChartsProps, "title">) {
  return (
    <section className="grid gap-3 xl:grid-cols-2">
      <div>
        <SectionHeader
          title={
            <span className="flex items-center justify-between gap-3">
              {title}
              <UsFlagIcon className="size-11 shrink-0" />
            </span>
          }
        />
        &nbsp;
      </div>
      <div>
        <SectionHeader
          title={
            <span className="flex items-center justify-between gap-3">
              {title}
              <PlFlagIcon className="size-11 shrink-0" />
            </span>
          }
        />
        &nbsp;
      </div>
    </section>
  );
}
