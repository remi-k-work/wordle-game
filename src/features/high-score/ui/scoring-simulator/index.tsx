// react
import { useState } from "react";

// services, features, and other libraries
import { T, Var, useGT, useMessages } from "gt-react";
import { useLocale } from "gt-tanstack-start";
import { calculatePotentialScore } from "@/features/game/domain/game-logic";
import { getBasePointsPerTurn, getSpeedMultiplier, potentialScoreAsPercentage } from "@/features/game/domain/helpers";
import { speedMultiplierToCategoryMessage } from "@/features/game/domain/formatters";
import { formatSeconds } from "@/domain/formatters";

// components
import { Progress } from "@base-ui/react/progress";
import { SimulatorSlider } from "./simulator-slider";

// types
interface ScoringSimulatorProps {
  guessedTurn?: number;
  timeElapsed?: number;
}

interface ScoreHeaderProps {
  isReportingScore: boolean;
  potentialScore: number;
  speedMultiplier: number;
  locale: string;
}

interface TurnMetricSectionProps {
  currentTurn: number;
  basePointsPerTurn: number;
  isReportingScore: boolean;
  locale: string;
  ariaLabel: string;
  // Only interactive mode needs a change handler; read-only reports omit it
  onTurnChange?: (turn: number) => void;
}

interface TimeMetricSectionProps {
  elapsedSeconds: number;
  speedMultiplier: number;
  isReportingScore: boolean;
  ariaLabel: string;
  // Only interactive mode needs a change handler; read-only reports omit it
  onElapsedChange?: (seconds: number) => void;
}

interface ScoreFormulaFooterProps {
  basePointsPerTurn: number;
  speedMultiplier: number;
  locale: string;
}

function ScoreHeader({ isReportingScore, potentialScore, speedMultiplier, locale }: ScoreHeaderProps) {
  const messages = useMessages();

  return (
    <header className="grid place-items-center gap-3 rounded-md border border-accent bg-surface-1 p-3">
      <h3 className="font-sans text-2xl font-semibold tracking-widest text-accent uppercase">
        {isReportingScore ? <T>Final Word Score</T> : <T>Live Potential</T>}
      </h3>
      <span className="text-3xl font-semibold tabular-nums sm:text-4xl">{potentialScore.toLocaleString(locale)}</span>
      <span className="text-xl font-semibold text-text-2 sm:text-2xl">{messages(speedMultiplierToCategoryMessage(speedMultiplier))}</span>
      <Progress.Root className="grid w-full" value={potentialScoreAsPercentage(potentialScore)}>
        <Progress.Track className="h-9 overflow-hidden rounded-sm border bg-linear-to-r from-destructive via-tile-yellow to-tile-green">
          <Progress.Indicator className="bg-linear-to-b from-surface-1 via-surface-3 to-surface-1 opacity-75 transition-[width] duration-1000 ease-in-out" />
        </Progress.Track>
      </Progress.Root>
    </header>
  );
}

function TurnMetricSection({ currentTurn, basePointsPerTurn, isReportingScore, locale, ariaLabel, onTurnChange = () => {} }: TurnMetricSectionProps) {
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

function TimeMetricSection({ elapsedSeconds, speedMultiplier, isReportingScore, ariaLabel, onElapsedChange = () => {} }: TimeMetricSectionProps) {
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

function ScoreFormulaFooter({ basePointsPerTurn, speedMultiplier, locale }: ScoreFormulaFooterProps) {
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

// Shared shell for both scoring simulator modes: the article wrapper, score header,
// and the two metric sections; interactive mode passes change handlers and renders
// the formula footer as children; report mode is read-only and omits both
function ScoringSimulatorBody({
  isReportingScore,
  potentialScore,
  speedMultiplier,
  locale,
  currentTurn,
  basePointsPerTurn,
  elapsedSeconds,
  ariaLabelTurn,
  ariaLabelTime,
  onTurnChange,
  onElapsedChange,
  children,
}: {
  isReportingScore: boolean;
  potentialScore: number;
  speedMultiplier: number;
  locale: string;
  currentTurn: number;
  basePointsPerTurn: number;
  elapsedSeconds: number;
  ariaLabelTurn: string;
  ariaLabelTime: string;
  onTurnChange?: (turn: number) => void;
  onElapsedChange?: (seconds: number) => void;
  children?: React.ReactNode;
}) {
  return (
    <article className="mx-auto grid max-w-4xl gap-6 bg-surface-2 p-3">
      <ScoreHeader isReportingScore={isReportingScore} potentialScore={potentialScore} speedMultiplier={speedMultiplier} locale={locale} />

      <div className="grid gap-3 sm:grid-cols-2">
        <TurnMetricSection
          currentTurn={currentTurn}
          basePointsPerTurn={basePointsPerTurn}
          isReportingScore={isReportingScore}
          locale={locale}
          ariaLabel={ariaLabelTurn}
          onTurnChange={onTurnChange}
        />
        <TimeMetricSection
          elapsedSeconds={elapsedSeconds}
          speedMultiplier={speedMultiplier}
          isReportingScore={isReportingScore}
          ariaLabel={ariaLabelTime}
          onElapsedChange={onElapsedChange}
        />
      </div>

      {children}
    </article>
  );
}

// Derives the score readings (plus `gt`/`locale`) shared by both simulator modes
// Keeping this in one hook means the turn/time → score derivation can't drift
// between the interactive and read-only report modes
function useScoreReadings(guessedTurn: number, timeElapsed: number) {
  const gt = useGT();
  const locale = useLocale();

  const potentialScore = calculatePotentialScore(guessedTurn, timeElapsed);
  const basePointsPerTurn = getBasePointsPerTurn(guessedTurn);
  const speedMultiplier = getSpeedMultiplier(timeElapsed);

  return { potentialScore, basePointsPerTurn, speedMultiplier, gt, locale };
}

// Interactive mode: owns its own turn/elapsed state, renders sliders + formula footer
function InteractiveScoringSimulator() {
  const [interactiveTurn, setInteractiveTurn] = useState(1);
  const [interactiveElapsed, setInteractiveElapsed] = useState(0);

  const { potentialScore, basePointsPerTurn, speedMultiplier, gt, locale } = useScoreReadings(interactiveTurn, interactiveElapsed);

  return (
    <ScoringSimulatorBody
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
    </ScoringSimulatorBody>
  );
}

// Report mode: purely presentational, derives everything from props, no state, no interactive sliders
// The metric sections render (sliders disabled) so the turn, time, and speed multiplier stay visible
// in read-only score reports such as the win modal
function FinalScoreReport({ guessedTurn, timeElapsed }: { guessedTurn: number; timeElapsed: number }) {
  const { potentialScore, basePointsPerTurn, speedMultiplier, gt, locale } = useScoreReadings(guessedTurn, timeElapsed);

  return (
    <ScoringSimulatorBody
      isReportingScore={true}
      potentialScore={potentialScore}
      speedMultiplier={speedMultiplier}
      locale={locale}
      currentTurn={guessedTurn}
      basePointsPerTurn={basePointsPerTurn}
      elapsedSeconds={timeElapsed}
      ariaLabelTurn={gt("Turn Guessed")}
      ariaLabelTime={gt("Time Elapsed")}
    />
  );
}

// Branches between the two modes: live simulation owns state; score report is a pure read of props
export function ScoringSimulator({ guessedTurn, timeElapsed }: ScoringSimulatorProps) {
  if (guessedTurn === undefined || timeElapsed === undefined) return <InteractiveScoringSimulator />;
  return <FinalScoreReport guessedTurn={guessedTurn} timeElapsed={timeElapsed} />;
}
