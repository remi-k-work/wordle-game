// components
import { Slider } from "@base-ui/react/slider";
import { GradientSliderTrack } from "@/ui/gradient-slider-track";

// types
import type { ReactNode } from "react";

// Everything that describes a control other than its current value and its
// change handler. The three controls share one slider and differ in exactly these
// fields, so the descriptor is a named type: each caller states its control as
// one value, and a field added here has to be supplied by all three at once
export interface VoiceControl {
  name: string;
  label: ReactNode;
  min: number;
  max: number;
  step: number;
}

interface VoiceSliderProps extends VoiceControl {
  value: number;
  disabled?: boolean;
  onValueChange: (value: number) => void;
}

// constants
import { VOICE_LABEL_CLASSES } from "./voice-label";

// Single chrome for Volume/Rate/Pitch — only the control's descriptor, its
// value, and its event differ
export function VoiceSlider({ name, label, min, max, step, value, disabled = false, onValueChange }: VoiceSliderProps) {
  return (
    <Slider.Root
      className="my-3 w-full"
      name={name}
      thumbAlignment="edge"
      min={min}
      max={max}
      step={step}
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <Slider.Label className={VOICE_LABEL_CLASSES}>{label}</Slider.Label>
      <GradientSliderTrack />
    </Slider.Root>
  );
}
