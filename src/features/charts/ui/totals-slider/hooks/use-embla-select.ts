// react
import { useEffect, useState } from "react";

// types
import type { EmblaCarouselType } from "embla-carousel";

interface EmblaSelectState {
  selectedIndex: number;
  canScrollPrev: boolean;
  canScrollNext: boolean;
}

// Tracks the active slide and scroll "reachability" of an Embla carousel in a single subscription
export function useEmblaSelect(emblaApi: EmblaCarouselType | undefined): EmblaSelectState {
  const [state, setState] = useState<EmblaSelectState>({ selectedIndex: 0, canScrollPrev: false, canScrollNext: true });

  useEffect(() => {
    if (!emblaApi) return;

    // Embla calls `select` on mount and on every `reInit`, including the ones that
    // change nothing; allocating a fresh state object for each of those would make
    // React schedule a render that re-renders the slides, the dots, and both nav
    // buttons with the very same numbers, so the next state is compared against the
    // current one before it is ever allocated
    const onSelect = (api: EmblaCarouselType) =>
      setState((current) => {
        const selectedIndex = api.selectedScrollSnap();
        const canScrollPrev = api.canScrollPrev();
        const canScrollNext = api.canScrollNext();

        const isUnchanged = current.selectedIndex === selectedIndex && current.canScrollPrev === canScrollPrev && current.canScrollNext === canScrollNext;
        if (isUnchanged) return current;

        return { selectedIndex, canScrollPrev, canScrollNext };
      });

    onSelect(emblaApi);
    emblaApi.on("reInit", onSelect).on("select", onSelect);

    return () => {
      emblaApi.off("reInit", onSelect).off("select", onSelect);
    };
  }, [emblaApi]);

  return state;
}
