// services, features, and other libraries
import { T } from "gt-react";
import { formatSeconds } from "@/domain/formatters";

// components
import { SimulatorSlider } from "./simulator-slider";

// types
interface TimeMetricSectionProps {
  elapsedSeconds: number;
  speedMultiplier: number;
  isReportingScore: boolean;
  ariaLabel: string;
  // Only interactive mode needs a change handler; read-only reports omit it
  onElapsedChange?: (seconds: number) => void;
}

export function TimeMetricSection({ elapsedSeconds, speedMultiplier, isReportingScore, ariaLabel, onElapsedChange = () => {} }: TimeMetricSectionProps) {
  return (
    <section className="grid place-items-center bg-surface-1 p-3">
      <h4 className="font-sans text-sm font-semibold tracking-widest text-text-2 uppercase">
        <T>Time Elapsed</T>
      </h4>
      <span className="font-semibold tabular-nums sm:text-lg">{formatSeconds(elapsedSeconds)}</span>
      <SimulatorSlider min={5} max={200} step={5} value={elapsedSeconds} onValueChange={onElapsedChange} disabled={isReportingScore} ariaLabel={ariaLabel} />
      <h4 className="font-sans text-sm font-semibold tracking-widest text-text-2 uppercase">
        <T>Speed Multiplier</T>
      </h4>
      <span className="font-semibold tabular-nums sm:text-lg">{speedMultiplier}x</span>
    </section>
  );
}
