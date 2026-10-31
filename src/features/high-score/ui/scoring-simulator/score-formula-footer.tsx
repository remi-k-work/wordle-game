// services, features, and other libraries
import { T, Var } from "gt-react";

// types
interface ScoreFormulaFooterProps {
  basePointsPerTurn: number;
  speedMultiplier: number;
  locale: string;
}

export function ScoreFormulaFooter({ basePointsPerTurn, speedMultiplier, locale }: ScoreFormulaFooterProps) {
  return (
    <footer className="mx-auto bg-surface-1 p-3 text-center text-lg sm:text-xl lg:text-2xl">
      <T>
        <p>
          Final Word Score = Base Points (
          <span className="inline-block min-w-[4ch] font-semibold text-text-2 tabular-nums">
            <Var>{basePointsPerTurn.toLocaleString(locale)}</Var>
          </span>
          ) x Speed Multiplier (
          <span className="inline-block min-w-[3ch] font-semibold text-text-2 tabular-nums">
            <Var>{speedMultiplier}</Var>
          </span>
          )
        </p>
      </T>
    </footer>
  );
}
