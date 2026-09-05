// components
import { Slider } from "@base-ui/react";

// types
interface SimulatorSliderProps {
  min: number;
  max: number;
  step?: number;
  value: number;
  disabled: boolean;
  ariaLabel: string;
  onValueChange: (value: number) => void;
}

export function SimulatorSlider({ min, max, step, value, disabled, ariaLabel, onValueChange }: SimulatorSliderProps) {
  return (
    <Slider.Root className="my-3 w-full" thumbAlignment="edge" min={min} max={max} step={step} value={value} disabled={disabled} onValueChange={onValueChange}>
      <Slider.Control className="flex w-full touch-none items-center py-3 select-none">
        <Slider.Track className="h-6 w-full bg-linear-to-l from-destructive via-tile-yellow to-tile-green select-none">
          <Slider.Indicator className="bg-linear-to-b from-surface-1 via-surface-3 to-surface-1 opacity-75 select-none" />
          <Slider.Thumb
            aria-label={ariaLabel}
            className="size-11 bg-primary select-none has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent"
          />
        </Slider.Track>
      </Slider.Control>
    </Slider.Root>
  );
}
