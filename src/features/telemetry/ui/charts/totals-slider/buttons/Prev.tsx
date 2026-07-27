// react
import { useEffect, useState } from "react";

// components
import { Button } from "@base-ui/react";

// assets
import { PrevIcon } from "@/assets/icons";

// types
import type { EmblaCarouselType } from "embla-carousel";

interface PrevProps {
  emblaApi?: EmblaCarouselType;
}

export function Prev({ emblaApi }: PrevProps) {
  const [isDisabled, setIsDisabled] = useState(true);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = (emblaApi: EmblaCarouselType) => setIsDisabled(!emblaApi.canScrollPrev());

    onSelect(emblaApi);
    emblaApi.on("reInit", onSelect).on("select", onSelect);

    return () => {
      emblaApi.off("reInit", onSelect).off("select", onSelect);
    };
  }, [emblaApi]);

  return (
    <Button className="button p-1" disabled={isDisabled} onClick={() => emblaApi?.scrollPrev()}>
      <PrevIcon className="size-11" />
    </Button>
  );
}

export function PrevSkeleton() {
  return (
    <Button className="button p-1" disabled>
      <PrevIcon className="size-11" />
    </Button>
  );
}
