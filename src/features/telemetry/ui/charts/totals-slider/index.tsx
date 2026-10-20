// react
import { useCallback } from "react";

// services, features, and other libraries
import useEmblaCarousel from "embla-carousel-react";
import { useEmblaSelect } from "./hooks/use-embla-select";

// components
import { Slide } from "./slide";
import { Dot } from "./buttons/dot";
import { Next } from "./buttons/next";
import { Prev } from "./buttons/prev";
import { AnyAvgStatChart } from "@/features/telemetry/ui/charts/any-avg-stat";
import { AnyCounterChart } from "@/features/telemetry/ui/charts/any-counter";
import { TOTALS_SLIDES, TotalsSlideSkeleton, type TotalsSlideSpec } from "./skeleton";

// types
import type { SolutionsLanguage } from "@/features/game/domain/models";

interface TotalsSliderProps {
  solutionsLanguage: SolutionsLanguage;
}

function TotalsSlideChart({ spec, solutionsLanguage }: { spec: TotalsSlideSpec; solutionsLanguage: SolutionsLanguage }) {
  if (spec.kind === "counter")
    return <AnyCounterChart counterName={spec.counterName} solutionsLanguage={solutionsLanguage} title={spec.title} personalHeader={spec.personalHeader} />;

  return (
    <AnyAvgStatChart
      statColumn={spec.statColumn}
      statTable={spec.statTable}
      solutionsLanguage={solutionsLanguage}
      title={spec.title}
      personalHeader={spec.personalHeader}
    />
  );
}

export function TotalsSlider({ solutionsLanguage }: TotalsSliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel();
  const { selectedIndex, canScrollPrev, canScrollNext } = useEmblaSelect(emblaApi);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => () => emblaApi?.scrollTo(index), [emblaApi]);
  const snapCount = emblaApi?.scrollSnapList().length ?? 0;

  return (
    <article className="grid grid-cols-[auto_1fr] grid-rows-[1fr_auto] gap-4 bg-surface-3 [grid-template-areas:'viewport_viewport''prevnext_dots']">
      <section ref={emblaRef} className="overflow-hidden select-none [grid-area:viewport]">
        <div className="-ms-4 flex touch-pan-y touch-pinch-zoom">
          {TOTALS_SLIDES.map((spec, index) => (
            <Slide key={index} index={index} selectedIndex={selectedIndex} skeleton={<TotalsSlideSkeleton spec={spec} />}>
              <TotalsSlideChart spec={spec} solutionsLanguage={solutionsLanguage} />
            </Slide>
          ))}
        </div>
      </section>
      <header className="flex items-center gap-4 p-2 [grid-area:prevnext]">
        <Prev onPrev={scrollPrev} disabled={!canScrollPrev} />
        <Next onNext={scrollNext} disabled={!canScrollNext} />
      </header>
      <footer className="flex flex-wrap items-center justify-end gap-1 p-2 [grid-area:dots]">
        {Array.from({ length: snapCount }, (_, index) => (
          <Dot key={index} index={index} selected={index === selectedIndex} onSelect={scrollTo(index)} />
        ))}
      </footer>
    </article>
  );
}

// The skeleton — together with the TOTALS_SLIDES spec set both components share —
// moved to ./skeleton so route-level Suspense fallbacks never bundle the embla
// carousel; re-exported here so the module's public API is unchanged
export { TotalsSliderSkeleton } from "./skeleton";
