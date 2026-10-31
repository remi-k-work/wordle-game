// services, features, and other libraries
import { T } from "gt-react";

// components
import { SimulatorSlider } from "./simulator-slider";

// types
interface TurnMetricSectionProps {
  currentTurn: number;
  basePointsPerTurn: number;
  isReportingScore: boolean;
  locale: string;
  ariaLabel: string;
  // Only interactive mode needs a change handler; read-only reports omit it
  onTurnChange?: (turn: number) => void;
}

export function TurnMetricSection({ currentTurn, basePointsPerTurn, isReportingScore, locale, ariaLabel, onTurnChange = () => {} }: TurnMetricSectionProps) {
  return (
    <section className="grid place-items-center bg-surface-1 p-3">
      <h4 className="font-sans text-sm font-semibold tracking-widest text-text-2 uppercase">
        <T>Turn Guessed</T>
      </h4>
      <span className="font-semibold tabular-nums sm:text-lg">{currentTurn}</span>
      <SimulatorSlider min={1} max={6} value={currentTurn} onValueChange={onTurnChange} disabled={isReportingScore} ariaLabel={ariaLabel} />
      <h4 className="font-sans text-sm font-semibold tracking-widest text-text-2 uppercase">
        <T>Base Points</T>
      </h4>
      <span className="font-semibold tabular-nums sm:text-lg">{basePointsPerTurn.toLocaleString(locale)}</span>
    </section>
  );
}
