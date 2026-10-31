// react
import { useState } from "react";

// services, features, and other libraries
import { useScoreReadings } from "@/features/high-score/hooks/use-score-readings";

// components
import { SimulatorBody } from "./simulator-body";
import { ScoreFormulaFooter } from "./score-formula-footer";

// Interactive mode: owns its own turn/elapsed state, renders sliders + formula footer
export function InteractiveMode() {
  const [interactiveTurn, setInteractiveTurn] = useState(1);
  const [interactiveElapsed, setInteractiveElapsed] = useState(0);

  const { potentialScore, basePointsPerTurn, speedMultiplier, gt, locale } = useScoreReadings(interactiveTurn, interactiveElapsed);

  return (
    <SimulatorBody
      isReportingScore={false}
      potentialScore={potentialScore}
      speedMultiplier={speedMultiplier}
      locale={locale}
      currentTurn={interactiveTurn}
      basePointsPerTurn={basePointsPerTurn}
      elapsedSeconds={interactiveElapsed}
      ariaLabelTurn={gt("Turn Guessed")}
      ariaLabelTime={gt("Time Elapsed")}
      onTurnChange={setInteractiveTurn}
      onElapsedChange={setInteractiveElapsed}
    >
      <ScoreFormulaFooter basePointsPerTurn={basePointsPerTurn} speedMultiplier={speedMultiplier} locale={locale} />
    </SimulatorBody>
  );
}
