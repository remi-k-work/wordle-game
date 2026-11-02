// services, features, and other libraries
import { Option } from "effect";

// components
import { BestRunCardFrame } from "./best-run-card-frame";
import { BestRunCardEmpty, BestRunCardEmptySkeleton } from "./best-run-card-empty";
import { BestRunCardFilled } from "./best-run-card-filled";

// types
import type { BestRunTrophyCardData } from "@/features/charts/domain/models";

interface BestRunCardProps {
  Tag?: "header" | "footer" | "section" | "div" | "article";
  variant: "primary" | "secondary";
  title: string;
  bestRun: Option.Option<BestRunTrophyCardData>;
}

// Delegates to the empty or filled state based on whether a best run exists
// Keeps the Option.match small and gives each visual state its own named,
// single-responsibility component
export function BestRunCard({ Tag = "section", variant, title, bestRun }: BestRunCardProps) {
  return (
    <BestRunCardFrame Tag={Tag} variant={variant} title={title}>
      {Option.match(bestRun, {
        onNone: () => <BestRunCardEmpty />,
        onSome: (bestRun) => <BestRunCardFilled bestRun={bestRun} />,
      })}
    </BestRunCardFrame>
  );
}

export function BestRunCardSkeleton({ Tag = "section", variant, title }: Omit<BestRunCardProps, "bestRun">) {
  return (
    <BestRunCardFrame Tag={Tag} variant={variant} title={title}>
      <BestRunCardEmptySkeleton />
    </BestRunCardFrame>
  );
}
