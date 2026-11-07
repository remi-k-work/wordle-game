// components
import { DotSkeleton } from "./buttons/dot";
import { NextSkeleton } from "./buttons/next";
import { PrevSkeleton } from "./buttons/prev";
import { AnyAvgStatChartSkeleton } from "@/features/charts/ui/any-avg-stat/skeleton";
import { AnyCounterChartSkeleton } from "@/features/charts/ui/any-counter/skeleton";
import { Slide } from "./slide";

// types
import type { TotalsSlideSpec } from "./constants";

// constants
import { TOTALS_SLIDES, slideKey } from "./constants";
import { TOTALS_CONTROLS_CLASSES, TOTALS_DOTS_CLASSES, TOTALS_SLIDE_ROW_CLASSES, TOTALS_SLIDER_CLASSES, TOTALS_VIEWPORT_CLASSES } from "./chrome";

export function TotalsSlideSkeleton({ spec }: { spec: TotalsSlideSpec }) {
  if (spec.kind === "counter") return <AnyCounterChartSkeleton title={spec.title} personalHeader={spec.personalHeader} />;

  return <AnyAvgStatChartSkeleton title={spec.title} personalHeader={spec.personalHeader} />;
}

export function TotalsSliderSkeleton() {
  return (
    <article className={TOTALS_SLIDER_CLASSES}>
      <section className={TOTALS_VIEWPORT_CLASSES}>
        <div className={TOTALS_SLIDE_ROW_CLASSES}>
          {TOTALS_SLIDES.map((spec) => (
            // The same slide wrapper the live slider renders, so the placeholder
            // tracks cannot drift out of the carousel's sizing
            <Slide key={slideKey(spec)}>{() => <TotalsSlideSkeleton spec={spec} />}</Slide>
          ))}
        </div>
      </section>
      <header className={TOTALS_CONTROLS_CLASSES}>
        <PrevSkeleton />
        <NextSkeleton />
      </header>
      <footer className={TOTALS_DOTS_CLASSES}>
        {TOTALS_SLIDES.map((spec) => (
          <DotSkeleton key={slideKey(spec)} />
        ))}
      </footer>
    </article>
  );
}
