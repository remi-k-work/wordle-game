// services, features, and other libraries
import { Atom, AsyncResult } from "effect/reactivity";
import { bestRunTrophyCardAtom } from "@/features/charts/state/charts";

// components
import { BestRunCard, BestRunCardSkeleton } from "./best-run-card";

// types
import type { ComponentProps } from "react";

type BestRunResult = Atom.Type<ReturnType<typeof bestRunTrophyCardAtom>>;
type BestRunSlotProps = Pick<ComponentProps<typeof BestRunCard>, "Tag" | "variant" | "title"> & { result: BestRunResult };

// Hoisted to module scope (outside `BestRunTrophyCardChart`) so its component
// identity is stable across re-renders; defining it inside the chart component
// would recreate `BestRunSlot` on every render, remounting both trophy-card
// subtrees (with their AsyncResult data hooks) whenever the chart re-renders
export function BestRunSlot({ result, ...cardProps }: BestRunSlotProps) {
  return AsyncResult.builder(result)
    .onInitialOrWaiting(() => <BestRunCardSkeleton {...cardProps} />)
    .onFailure(() => <BestRunCardSkeleton {...cardProps} />)
    .onSuccess((bestRun) => <BestRunCard {...cardProps} bestRun={bestRun} />)
    .render();
}
