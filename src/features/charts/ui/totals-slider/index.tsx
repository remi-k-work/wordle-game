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

interface TotalsSliderProps {
  solutionsLanguage: SolutionsLanguage;
}

// constants
import { TOTALS_SLIDES, slideKey } from "./constants";
import { TOTALS_CONTROLS_CLASSES, TOTALS_DOTS_CLASSES, TOTALS_SLIDE_ROW_CLASSES, TOTALS_SLIDER_CLASSES, TOTALS_VIEWPORT_CLASSES } from "./chrome";

export function TotalsSlider({ solutionsLanguage }: TotalsSliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel();
  const { selectedIndex, canScrollPrev, canScrollNext } = useEmblaSelect(emblaApi);

  return (
    <article className={TOTALS_SLIDER_CLASSES}>
      <section ref={emblaRef} className={TOTALS_VIEWPORT_CLASSES}>
        <div className={TOTALS_SLIDE_ROW_CLASSES}>
          {TOTALS_SLIDES.map((spec, index) => {
            const isActive = index === selectedIndex;

            // Both branches are a function of `isActive` (which this component
            // already needs for the dots), so neither element is built for the
            // nine slides that discard it
            return (
              <Slide key={slideKey(spec)}>
                {() => (isActive ? <TotalsSlideChart spec={spec} solutionsLanguage={solutionsLanguage} /> : <TotalsSlideSkeleton spec={spec} />)}
              </Slide>
            );
          })}
        </div>
      </section>
      <header className={TOTALS_CONTROLS_CLASSES}>
        <Prev onPrev={() => emblaApi?.scrollPrev()} disabled={!canScrollPrev} />
        <Next onNext={() => emblaApi?.scrollNext()} disabled={!canScrollNext} />
      </header>
      <footer className={TOTALS_DOTS_CLASSES}>
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
