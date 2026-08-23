// react
import { useEffect, useState } from "react";

// components
import { Button } from "@base-ui/react";
import { useGT } from "gt-next";

// assets
import { NextIcon } from "@/assets/icons";

// types
import type { EmblaCarouselType } from "embla-carousel";

interface NextProps {
  emblaApi?: EmblaCarouselType;
}

export function Next({ emblaApi }: NextProps) {
  const [isDisabled, setIsDisabled] = useState(true);
  const gt = useGT();

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = (emblaApi: EmblaCarouselType) => setIsDisabled(!emblaApi.canScrollNext());

    onSelect(emblaApi);
    emblaApi.on("reInit", onSelect).on("select", onSelect);

    return () => {
      emblaApi.off("reInit", onSelect).off("select", onSelect);
    };
  }, [emblaApi]);

  return (
    <Button className="button p-1" title={gt("Next chart")} aria-label={gt("Next chart")} disabled={isDisabled} onClick={() => emblaApi?.scrollNext()}>
      <NextIcon className="size-11" />
    </Button>
  );
}

export function NextSkeleton() {
  return (
    <Button className="button p-1" disabled>
      <NextIcon className="size-11" />
    </Button>
  );
}
