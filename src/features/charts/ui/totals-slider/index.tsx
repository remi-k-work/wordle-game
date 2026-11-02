// services, features, and other libraries
import useEmblaCarousel from "embla-carousel-react";
import { useEmblaSelect } from "./hooks/use-embla-select";

// components
import { Slide } from "./slide";
import { Dot } from "./buttons/dot";
import { Next } from "./buttons/next";
import { Prev } from "./buttons/prev";
import { TotalsSlideChart } from "./totals-slide-chart";
import { TotalsSlideSkeleton } from "./skeleton";

// types
import type { SolutionsLanguage } from "@/features/game/domain/models";
import type { TotalsSlideSpec } from "./constants";

interface TotalsSliderProps {
  solutionsLanguage: SolutionsLanguage;
}

// constants
import { TOTALS_SLIDES } from "./constants";

// Each slide spec maps to a stable, unique key (counter name or stat column)
// shared by the slide and its navigation dot — defined once so the two `.map()`
// calls below can't drift out of sync
const slideKey = (spec: TotalsSlideSpec): string => (spec.kind === "counter" ? spec.counterName : spec.statColumn);

export function TotalsSlider({ solutionsLanguage }: TotalsSliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel();
  const { selectedIndex, canScrollPrev, canScrollNext } = useEmblaSelect(emblaApi);

  return (
    <article className="grid grid-cols-[auto_1fr] grid-rows-[1fr_auto] gap-4 bg-surface-3 [grid-template-areas:'viewport_viewport''prevnext_dots']">
      <section ref={emblaRef} className="overflow-hidden select-none [grid-area:viewport]">
        <div className="-ms-4 flex touch-pan-y touch-pinch-zoom">
          {TOTALS_SLIDES.map((spec, index) => (
            <Slide key={slideKey(spec)} index={index} selectedIndex={selectedIndex} skeleton={<TotalsSlideSkeleton spec={spec} />}>
              <TotalsSlideChart spec={spec} solutionsLanguage={solutionsLanguage} />
            </Slide>
          ))}
        </div>
      </section>
      <header className="flex items-center gap-4 p-2 [grid-area:prevnext]">
        <Prev onPrev={() => emblaApi?.scrollPrev()} disabled={!canScrollPrev} />
        <Next onNext={() => emblaApi?.scrollNext()} disabled={!canScrollNext} />
      </header>
      <footer className="flex flex-wrap items-center justify-end gap-1 p-2 [grid-area:dots]">
        {TOTALS_SLIDES.map((spec, index) => (
          <Dot key={slideKey(spec)} index={index} selected={index === selectedIndex} onSelect={(dotIndex) => emblaApi?.scrollTo(dotIndex)} />
        ))}
      </footer>
    </article>
  );
}

// The skeleton — together with the TOTALS_SLIDES spec set both components share —
// moved to ./skeleton so route-level Suspense fallbacks never bundle the embla
// carousel; re-exported here so the module's public API is unchanged
export { TotalsSliderSkeleton } from "./skeleton";
