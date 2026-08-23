// services, features, and other libraries
import { cn } from "@/lib/utils";
import { DateTime, Duration, Option } from "effect";
import { useGT, useLocale } from "gt-next";
import { formatDuration } from "@/lib/formatters";

// components
import { InfoLine } from "@/ui/info-line";

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

// constants
const VARIANT_STYLES = {
  primary: "border-primary text-primary",
  secondary: "border-secondary text-secondary",
} as const;

export function BestRunCard({ Tag = "section", variant, title, bestRun }: BestRunCardProps) {
  const gt = useGT();
  const locale = useLocale();

  return (
    <Tag
      className={cn(
        "row-span-7 grid grid-rows-subgrid font-semibold",
        "rounded-xl border-2 text-center",
        "w-3/4 max-w-lg place-items-center justify-self-center",
        VARIANT_STYLES[variant]
      )}
    >
      <h3 className="tracking-widest uppercase">{title}</h3>
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
              {formatDuration(Duration.seconds(durationSeconds))}
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
    </Tag>
  );
}

export function BestRunCardSkeleton({ Tag = "section", variant, title }: Omit<BestRunCardProps, "bestRun">) {
  const gt = useGT();

  return (
    <Tag
      className={cn(
        "row-span-7 grid grid-rows-subgrid font-semibold",
        "rounded-xl border-2 text-center",
        "w-3/4 max-w-lg place-items-center justify-self-center",
        VARIANT_STYLES[variant]
      )}
    >
      <h3 className="tracking-widest uppercase">{title}</h3>
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
    </Tag>
  );
}
