// services, features, and other libraries
import { T, useGT } from "gt-react";
import { useLocale } from "gt-tanstack-start";

// components
import { SimulatorSlider } from "./simulator-slider";

// types
interface TurnMetricSectionProps {
  currentTurn: number;
  basePointsPerTurn: number;
  isReportingScore: boolean;
  // Only interactive mode needs a change handler; read-only reports omit it
  onTurnChange?: (turn: number) => void;
}

// The heading and the slider's accessible name are the same message, and the
// only number needing formatting is below, so both are resolved here instead of
// having the shared shell translate one and pass the other down
export function TurnMetricSection({ currentTurn, basePointsPerTurn, isReportingScore, onTurnChange = () => {} }: TurnMetricSectionProps) {
  const gt = useGT();
  const locale = useLocale();

  return (
    <section className="grid place-items-center bg-surface-1 p-3">
      <h4 className="font-sans text-sm font-semibold tracking-widest text-text-2 uppercase">
        <T>Turn Guessed</T>
      </h4>
      <span className="font-semibold tabular-nums sm:text-lg">{currentTurn}</span>
      <SimulatorSlider min={1} max={6} value={currentTurn} onValueChange={onTurnChange} disabled={isReportingScore} ariaLabel={gt("Turn Guessed")} />
      <h4 className="font-sans text-sm font-semibold tracking-widest text-text-2 uppercase">
        <T>Base Points</T>
      </h4>
      <span className="font-semibold tabular-nums sm:text-lg">{basePointsPerTurn.toLocaleString(locale)}</span>
    </section>
  );
}
