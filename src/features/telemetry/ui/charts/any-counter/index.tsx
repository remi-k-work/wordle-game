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

  return AsyncResult.builder(anyCounter)
    .onInitialOrWaiting(() => <AnyCounterChartSkeleton title={title} personalHeader={personalHeader} />)
    .onFailure(() => <AnyCounterChartSkeleton title={title} personalHeader={personalHeader} />)
    .onSuccess((anyCounter) =>
      anyCounter.length === 0 ? (
        <>
          <SectionHeader title={title} />
          <InfoLine message="No counter data tracked yet!" />
        </>
      ) : (
        <>
          <SectionHeader title={title} />
          <article className="grid grid-cols-2 gap-6">
            <header className="grid aspect-auto w-3/4 max-w-sm gap-3 justify-self-center rounded-xl border-2 border-primary bg-(--color-surface-1) p-3 text-center md:aspect-square md:p-6 lg:p-9">
              <h3 className="font-semibold tracking-widest text-(--color-primary) uppercase sm:text-xl md:text-2xl lg:text-3xl">{personalHeader}</h3>
              <span className="text-4xl font-semibold wrap-anywhere text-(--color-primary) sm:text-5xl md:text-6xl lg:text-7xl">
                {anyCounter[0].personal.toLocaleString()}
              </span>
            </header>

            <footer className="grid aspect-auto w-3/4 max-w-sm gap-3 justify-self-center rounded-xl border-2 border-secondary bg-(--color-surface-1) p-3 text-center md:aspect-square md:p-6 lg:p-9">
              <h3 className="font-semibold tracking-widest text-(--color-secondary) uppercase sm:text-xl md:text-2xl lg:text-3xl">Global Total</h3>
              <span className="text-4xl font-semibold wrap-anywhere text-(--color-secondary) sm:text-5xl md:text-6xl lg:text-7xl">
                {anyCounter[0].global.toLocaleString()}
              </span>
            </footer>
          </article>
        </>
      )
    )
    .render();
}

export function AnyCounterChartSkeleton({ title, personalHeader }: Pick<AnyCounterChartProps, "title" | "personalHeader">) {
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
          <h3 className="font-semibold tracking-widest text-(--color-secondary) uppercase sm:text-xl md:text-2xl lg:text-3xl">Global Total</h3>
          <span className="animate-pulse bg-accent text-4xl font-semibold wrap-anywhere text-(--color-secondary) sm:text-5xl md:text-6xl lg:text-7xl">
            &nbsp;
          </span>
        </footer>
      </article>
    </>
  );
}
