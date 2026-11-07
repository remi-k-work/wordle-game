// components
import { Slider } from "@base-ui/react/slider";
import { GradientSliderTrack } from "@/ui/gradient-slider-track";

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
      {/* The thumb is the simulator's only accessible name for the control, so
          the track owns that label through the shared chrome below */}
      <GradientSliderTrack thumbLabel={ariaLabel} />
    </Slider.Root>
  );
}
