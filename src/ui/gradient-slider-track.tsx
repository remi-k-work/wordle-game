// services, features, and other libraries
import { cn } from "@/lib/utils";

// components
import { Slider } from "@base-ui/react/slider";

// constants
const CONTROL_CLASSES = cn("flex w-full touch-none items-center py-3 select-none");
const TRACK_CLASSES = cn("h-6 w-full bg-linear-to-l from-destructive via-tile-yellow to-tile-green select-none");
const INDICATOR_CLASSES = cn("bg-linear-to-b from-surface-1 via-surface-3 to-surface-1 opacity-75 select-none");
const THUMB_CLASSES = cn("size-11 bg-primary select-none", "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent");

// The gradient range track shared by the voice settings and the scoring simulator
export function GradientSliderTrack({ thumbLabel }: { thumbLabel?: string }) {
  return (
    <Slider.Control className={CONTROL_CLASSES}>
      <Slider.Track className={TRACK_CLASSES}>
        <Slider.Indicator className={INDICATOR_CLASSES} />
        <Slider.Thumb aria-label={thumbLabel} className={THUMB_CLASSES} />
      </Slider.Track>
    </Slider.Control>
  );
}
