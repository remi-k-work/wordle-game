// services, features, and other libraries
import { DateTime } from "effect";
import { useGT } from "gt-react";
import { useLocale } from "gt-tanstack-start";
import { formatSeconds } from "@/domain/formatters";

// assets
import { CalendarIcon, ClockIcon, FireIcon, TrophyIcon } from "@heroicons/react/24/outline";

// types
import type { BestRunTrophyCardData } from "@/features/charts/domain/models";

interface BestRunCardFilledProps {
  bestRun: BestRunTrophyCardData;
}

// Renders the "has data" state — the run's score, streak, duration, end reason, and date
export function BestRunCardFilled({ bestRun: { deathReason, failedOnWord, finalScore, finalStreak, durationSeconds, createdAt } }: BestRunCardFilledProps) {
  const gt = useGT();
  const locale = useLocale();

  return (
    <>
      <span className="flex items-center gap-1 text-3xl wrap-anywhere text-accent">
        <TrophyIcon className="size-9" />
        {finalScore.toLocaleString(locale)}
      </span>
      <span className="flex items-center gap-1 text-3xl wrap-anywhere text-destructive">
        <FireIcon className="size-9" />
        {finalStreak}
      </span>
      <span className="flex items-center gap-1 text-3xl wrap-anywhere">
        <ClockIcon className="size-9" />
        {formatSeconds(durationSeconds)}
      </span>
      <h4 className="max-w-none place-self-end justify-self-center font-sans text-sm tracking-widest uppercase">{gt("Ended By")}</h4>
      <span className="text-3xl wrap-anywhere">{deathReason === "Guesses" ? gt("Failed on {word}", { word: failedOnWord }) : gt("Forfeit")}</span>
      <span className="flex items-center gap-1 text-sm">
        <CalendarIcon className="size-6" />
        {DateTime.formatLocal(createdAt, { locale, day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
      </span>
    </>
  );
}
