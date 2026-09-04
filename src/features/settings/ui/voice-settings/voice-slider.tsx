// components
import { Slider } from "@base-ui/react";

// types
import type { ReactNode } from "react";

interface VoiceSliderFieldProps {
  name: string;
  label: ReactNode;
  min: number;
  max: number;
  step: number;
  value: number;
  disabled?: boolean;
  onValueChange: (value: number) => void;
}

// Single chrome for Volume/Rate/Pitch — only range, value, and event differ.
export function VoiceSliderField({ name, label, min, max, step, value, disabled = false, onValueChange }: VoiceSliderFieldProps) {
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
      <Slider.Label className="cursor-default font-sans text-sm font-semibold tracking-widest text-text-2 uppercase">{label}</Slider.Label>
      <Slider.Control className="flex w-full touch-none items-center py-3 select-none">
        <Slider.Track className="h-6 w-full bg-linear-to-l from-destructive via-tile-yellow to-tile-green select-none">
          <Slider.Indicator className="bg-linear-to-b from-surface-1 via-surface-3 to-surface-1 opacity-75 select-none" />
          <Slider.Thumb className="size-11 bg-primary select-none has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent" />
        </Slider.Track>
      </Slider.Control>
    </Slider.Root>
  );
}

interface VoiceSliderSkeletonProps {
  name: string;
  label: ReactNode;
  min: number;
  max: number;
  step: number;
  skeletonValue?: number;
}

export function VoiceSliderSkeleton({ name, label, min, max, step, skeletonValue = 1 }: VoiceSliderSkeletonProps) {
  return <VoiceSliderField name={name} label={label} min={min} max={max} step={step} value={skeletonValue} disabled onValueChange={() => {}} />;
}
