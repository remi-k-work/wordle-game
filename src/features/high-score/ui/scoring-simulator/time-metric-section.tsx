// services, features, and other libraries
import { T, useGT } from "gt-react";
import { formatSeconds } from "@/domain/formatters";

// components
import { SimulatorSlider } from "./simulator-slider";

// types
interface TimeMetricSectionProps {
  elapsedSeconds: number;
  speedMultiplier: number;
  isReportingScore: boolean;
  // Only interactive mode needs a change handler; read-only reports omit it
  onElapsedChange?: (seconds: number) => void;
}

// The heading and the slider's accessible name are the same message, so `gt` is
// resolved here instead of having the shared shell translate one and pass the
// other down (matching the turn metric section beside it)
export function TimeMetricSection({ elapsedSeconds, speedMultiplier, isReportingScore, onElapsedChange = () => {} }: TimeMetricSectionProps) {
  const gt = useGT();
  return (
    <section className="grid place-items-center bg-surface-1 p-3">
      <h4 className="font-sans text-sm font-semibold tracking-widest text-text-2 uppercase">
        <T>Time Elapsed</T>
      </h4>
      <span className="font-semibold tabular-nums sm:text-lg">{formatSeconds(elapsedSeconds)}</span>
      <SimulatorSlider
        min={5}
        max={200}
        step={5}
        value={elapsedSeconds}
        onValueChange={onElapsedChange}
        disabled={isReportingScore}
        ariaLabel={gt("Time Elapsed")}
      />
      <h4 className="font-sans text-sm font-semibold tracking-widest text-text-2 uppercase">
        <T>Speed Multiplier</T>
      </h4>
      <span className="font-semibold tabular-nums sm:text-lg">{speedMultiplier}x</span>
    </section>
  );
}
