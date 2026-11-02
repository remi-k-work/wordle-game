// components
import { DotSkeleton } from "./buttons/dot";
import { NextSkeleton } from "./buttons/next";
import { PrevSkeleton } from "./buttons/prev";
import { AnyAvgStatChartSkeleton } from "@/features/charts/ui/any-avg-stat";
import { AnyCounterChartSkeleton } from "@/features/charts/ui/any-counter";

// types
import type { TotalsSlideSpec } from "./constants";

// constants
import { TOTALS_SLIDES } from "./constants";
import { SLIDE_CLASS } from "./slide";

export function TotalsSlideSkeleton({ spec }: { spec: TotalsSlideSpec }) {
  if (spec.kind === "counter") return <AnyCounterChartSkeleton title={spec.title} personalHeader={spec.personalHeader} />;

  return <AnyAvgStatChartSkeleton title={spec.title} personalHeader={spec.personalHeader} />;
}

export function TotalsSliderSkeleton() {
  return (
    <article className="grid grid-cols-[auto_1fr] grid-rows-[1fr_auto] gap-4 bg-surface-3 [grid-template-areas:'viewport_viewport''prevnext_dots']">
      <section className="overflow-hidden select-none [grid-area:viewport]">
        <div className="-ms-4 flex touch-pan-y touch-pinch-zoom">
          {TOTALS_SLIDES.map((spec, index) => (
            <div key={index} className={SLIDE_CLASS}>
              <TotalsSlideSkeleton spec={spec} />
            </div>
          ))}
        </div>
      </section>
      <header className="flex items-center gap-4 p-2 [grid-area:prevnext]">
        <PrevSkeleton />
        <NextSkeleton />
      </header>
      <footer className="flex flex-wrap items-center justify-end gap-1 p-2 [grid-area:dots]">
        {TOTALS_SLIDES.map((_, index) => (
          <DotSkeleton key={index} />
        ))}
      </footer>
    </article>
  );
}
