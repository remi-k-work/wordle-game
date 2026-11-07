// services, features, and other libraries
import { Atom } from "effect/reactivity";
import { bestRunTrophyCardAtom } from "@/features/charts/state/charts";

// components
import { BestRunCard, BestRunCardSkeleton } from "./best-run-card";
import { StatSection } from "@/features/charts/ui/stat-section";

// types
import type { ComponentProps } from "react";

type BestRunResult = Atom.Type<ReturnType<typeof bestRunTrophyCardAtom>>;
type BestRunSlotProps = Pick<ComponentProps<typeof BestRunCard>, "Tag" | "variant" | "title"> & { result: BestRunResult };

export function BestRunSlot({ result, ...cardProps }: BestRunSlotProps) {
  return (
    <StatSection result={result} skeleton={<BestRunCardSkeleton {...cardProps} />}>
      {(bestRun) => <BestRunCard {...cardProps} bestRun={bestRun} />}
    </StatSection>
  );
}
