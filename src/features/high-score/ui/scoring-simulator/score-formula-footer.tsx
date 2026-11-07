// services, features, and other libraries
import { T, Var } from "gt-react";
import { useLocale } from "gt-tanstack-start";

// types
import type { ScoreReadings } from "@/features/high-score/domain/helpers";

interface ScoreFormulaFooterProps {
  // The factors the formula is built from; they are the readings `SimulatorBody`
  // already derived for the sections above, handed over rather than recomputed
  // from the raw turn/elapsed inputs here — one owner of the score formula
  basePointsPerTurn: ScoreReadings["basePointsPerTurn"];
  speedMultiplier: ScoreReadings["speedMultiplier"];
}

export function ScoreFormulaFooter({ basePointsPerTurn, speedMultiplier }: ScoreFormulaFooterProps) {
  const locale = useLocale();

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
