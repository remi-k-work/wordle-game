// react
import { useEffect, useState } from "react";

// services, features, and other libraries
import { cn } from "@/lib/utils";

// components
import { Button } from "@base-ui/react";

// assets
import { ViewfinderCircleIcon as ViewfinderCircleIconS } from "@heroicons/react/24/solid";
import { ViewfinderCircleIcon as ViewfinderCircleIconO } from "@heroicons/react/24/outline";

// types
import type { EmblaCarouselType } from "embla-carousel";

interface DotProps {
  emblaApi?: EmblaCarouselType;
  index: number;
}

export function Dot({ emblaApi, index }: DotProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = (emblaApi: EmblaCarouselType) => setSelectedIndex(emblaApi.selectedScrollSnap());

    onSelect(emblaApi);
    emblaApi.on("reInit", onSelect).on("select", onSelect);

    return () => {
      emblaApi.off("reInit", onSelect).off("select", onSelect);
    };
  }, [emblaApi]);

  return (
    <Button className={cn("button bg-secondary p-0", index === selectedIndex && "bg-accent")} onClick={() => emblaApi?.scrollTo(index)}>
      {index === selectedIndex ? <ViewfinderCircleIconS className="size-11" /> : <ViewfinderCircleIconO className="size-11" />}
    </Button>
  );
}

export function DotSkeleton() {
  return (
    <Button className="button bg-secondary p-0" disabled>
      <ViewfinderCircleIconO className="size-11" />
    </Button>
  );
}
