// services, features, and other libraries
import { Option } from "effect";

// components
import { BestRunCardFrame } from "./best-run-card-frame";
import { BestRunCardEmpty } from "./best-run-card-empty";
import { BestRunCardFilled } from "./best-run-card-filled";
import { BestRunCardLoading } from "./best-run-card-loading";

// types
import type { CardTag, CardVariant } from "@/ui/card-variants";
import type { BestRunTrophyCardData } from "@/features/charts/domain/models";

interface BestRunCardProps {
  Tag?: CardTag;
  variant: CardVariant;
  title: string;
  bestRun: Option.Option<BestRunTrophyCardData>;
}

// Delegates to the empty or filled state based on whether a best run exists
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

// The loading state is a third state of its own (not the skeleton of the empty state), so it lives in ./best-run-card-loading
export function BestRunCardSkeleton({ Tag = "section", variant, title }: Omit<BestRunCardProps, "bestRun">) {
  return (
    <BestRunCardFrame Tag={Tag} variant={variant} title={title}>
      <BestRunCardLoading />
    </BestRunCardFrame>
  );
}
