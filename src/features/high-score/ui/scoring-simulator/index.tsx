"use client";

// react
import { useState } from "react";

// services, features, and other libraries
import { T, Var, useGT, useLocale, useMessages } from "gt-next";
import { calculatePotentialScore, getBasePointsPerTurn, getSpeedMultiplier, potentialScoreAsPercentage } from "@/features/game/domain";
import { speedMultiplierToCategoryMessage } from "@/features/game/domain";
import { formatSeconds } from "@/lib/formatters";

// components
import { Progress } from "@base-ui/react";
import { SimulatorSlider } from "./simulator-slider";

// types
interface ScoringSimulatorProps {
  guessedTurn?: number;
  timeElapsed?: number;
}

export function ScoringSimulator({ guessedTurn, timeElapsed }: ScoringSimulatorProps) {
  const [currentTurn, setCurrentTurn] = useState(guessedTurn ?? 1);
  const [elapsedSeconds, setElapsedSeconds] = useState(timeElapsed ?? 0);

  const potentialScore = calculatePotentialScore(currentTurn, elapsedSeconds);
  const basePointsPerTurn = getBasePointsPerTurn(currentTurn);
  const speedMultiplier = getSpeedMultiplier(elapsedSeconds);

  const isReportingScore = guessedTurn !== undefined && timeElapsed !== undefined;
  const gt = useGT();
  const locale = useLocale();
  const messages = useMessages();

  return (
    <article className="mx-auto grid max-w-4xl gap-6 bg-surface-2 p-3">
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

      <div className="grid gap-3 sm:grid-cols-2">
        <section className="grid place-items-center bg-surface-1 p-3">
          <h4 className="font-sans text-sm font-semibold tracking-widest text-text-2 uppercase">
            <T>Turn Guessed</T>
          </h4>
          <span className="font-semibold tabular-nums sm:text-lg">{currentTurn}</span>
          <SimulatorSlider min={1} max={6} value={currentTurn} onValueChange={setCurrentTurn} disabled={isReportingScore} ariaLabel={gt("Turn Guessed")} />
          <h4 className="font-sans text-sm font-semibold tracking-widest text-text-2 uppercase">
            <T>Base Points</T>
          </h4>
          <span className="font-semibold tabular-nums sm:text-lg">{basePointsPerTurn.toLocaleString(locale)}</span>
        </section>

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
            onValueChange={setElapsedSeconds}
            disabled={isReportingScore}
            ariaLabel={gt("Time Elapsed")}
          />
          <h4 className="font-sans text-sm font-semibold tracking-widest text-text-2 uppercase">
            <T>Speed Multiplier</T>
          </h4>
          <span className="font-semibold tabular-nums sm:text-lg">{speedMultiplier}x</span>
        </section>
      </div>

      {!isReportingScore && (
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
      )}
    </article>
  );
}
