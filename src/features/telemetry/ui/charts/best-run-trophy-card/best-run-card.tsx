// services, features, and other libraries
import { DateTime, Option } from "effect";
import { useGT, useLocale } from "gt-next";
import { formatSeconds } from "@/lib/formatters";

// components
import { InfoLine } from "@/ui/info-line";
import { BestRunCardFrame } from "./best-run-card-frame";

// assets
import { CalendarIcon, ClockIcon, FireIcon, TrophyIcon } from "@heroicons/react/24/outline";

// types
import type { BestRunTrophyCardData } from "@/features/telemetry/services/charts-db";

interface BestRunCardProps {
  Tag?: "header" | "footer" | "section" | "div" | "article";
  variant: "primary" | "secondary";
  title: string;
  bestRun: Option.Option<BestRunTrophyCardData>;
}

export function BestRunCard({ Tag = "section", variant, title, bestRun }: BestRunCardProps) {
  const gt = useGT();
  const locale = useLocale();

  return (
    <BestRunCardFrame Tag={Tag} variant={variant} title={title}>
      {Option.match(bestRun, {
        onNone: () => <InfoLine className="row-span-6 font-normal" message={gt("No completed runs yet!")} />,
        onSome: ({ deathReason, failedOnWord, finalScore, finalStreak, durationSeconds, createdAt }) => (
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
        ),
      })}
    </BestRunCardFrame>
  );
}

export function BestRunCardSkeleton({ Tag = "section", variant, title }: Omit<BestRunCardProps, "bestRun">) {
  const gt = useGT();

  return (
    <BestRunCardFrame Tag={Tag} variant={variant} title={title}>
      <span className="flex items-center gap-1 text-3xl wrap-anywhere text-accent">
        <TrophyIcon className="size-9" />
        &nbsp;
      </span>
      <span className="flex items-center gap-1 text-3xl wrap-anywhere text-destructive">
        <FireIcon className="size-9" />
        &nbsp;
      </span>
      <span className="flex items-center gap-1 text-3xl wrap-anywhere">
        <ClockIcon className="size-9" />
        &nbsp;
      </span>
      <h4 className="max-w-none place-self-end justify-self-center font-sans text-sm tracking-widest uppercase">{gt("Ended By")}</h4>
      <span className="text-3xl wrap-anywhere">&nbsp;</span>
      <span className="flex items-center gap-1 text-sm">
        <CalendarIcon className="size-6" />
        &nbsp;
      </span>
    </BestRunCardFrame>
  );
}
