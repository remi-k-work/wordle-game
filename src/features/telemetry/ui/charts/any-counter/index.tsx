// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { AsyncResult } from "effect/unstable/reactivity";
import { anyCounterAtom } from "@/features/telemetry/state";

// components
import { InfoLine } from "@/ui/info-line";
import { SectionHeader } from "@/ui/section-header";

// types
import type { SolutionsLanguage } from "@/features/game/domain";

interface AnyCounterChartProps {
  counterName: string;
  solutionsLanguage: SolutionsLanguage;
  title: string;
  personalHeader: string;
}

export function AnyCounterChart({ counterName, solutionsLanguage, title, personalHeader }: AnyCounterChartProps) {
  const anyCounter = useAtomValue(anyCounterAtom({ counterName, solutionsLanguage }));

  return (
    <>
      <SectionHeader title={title} />
      {AsyncResult.builder(anyCounter)
        .onInitialOrWaiting(() => <AnyCounterChartSkeleton title={title} personalHeader={personalHeader} />)
        .onFailure(() => <AnyCounterChartSkeleton title={title} personalHeader={personalHeader} />)
        .onSuccess((anyCounter) =>
          anyCounter.length === 0 ? (
            <InfoLine message="No counter data tracked yet!" />
          ) : (
            <article className="grid grid-cols-2 gap-6">
              <header className="grid w-3/4 max-w-sm gap-3 justify-self-center rounded-xl bg-(--color-surface-2) p-6 text-center shadow-sm ring-1 ring-(--color-accent)">
                <h3 className="font-sans tracking-widest text-(--color-text-2)">{personalHeader}</h3>
                <span className="text-4xl font-semibold wrap-anywhere text-(--color-primary)">{anyCounter[0].personal.toLocaleString()}</span>
              </header>

              <footer className="grid w-3/4 max-w-sm gap-3 justify-self-center rounded-xl bg-(--color-surface-2) p-6 text-center shadow-sm ring-1 ring-(--color-accent)">
                <h3 className="font-sans tracking-widest text-(--color-text-2)">Global Total</h3>
                <span className="text-4xl font-semibold wrap-anywhere text-(--color-secondary)">{anyCounter[0].global.toLocaleString()}</span>
              </footer>
            </article>
          )
        )
        .render()}
    </>
  );
}

export function AnyCounterChartSkeleton({ title, personalHeader }: Pick<AnyCounterChartProps, "title" | "personalHeader">) {
  return (
    <>
      <SectionHeader title={title} />
      <article className="grid grid-cols-2 gap-6">
        <header className="grid w-3/4 max-w-sm gap-3 justify-self-center rounded-xl bg-(--color-surface-2) p-6 text-center shadow-sm ring-1 ring-(--color-accent)">
          <h3 className="animate-pulse bg-accent font-sans tracking-widest text-(--color-text-2)">{personalHeader}</h3>
          <span className="animate-pulse bg-accent text-4xl font-semibold wrap-anywhere text-(--color-primary)">&nbsp;</span>
        </header>

        <footer className="grid w-3/4 max-w-sm gap-3 justify-self-center rounded-xl bg-(--color-surface-2) p-6 text-center shadow-sm ring-1 ring-(--color-accent)">
          <h3 className="font-sans tracking-widest text-(--color-text-2)">Global Total</h3>
          <span className="animate-pulse bg-accent text-4xl font-semibold wrap-anywhere text-(--color-secondary)">&nbsp;</span>
        </footer>
      </article>
    </>
  );
}
