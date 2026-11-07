// services, features, and other libraries
import { cn } from "@/lib/utils";
import { useMessages } from "gt-react";

// components
import { SectionHeader, SectionHeaderSkeleton } from "@/ui/section-header";
import { StatCard, StatCardValueSkeleton } from "@/ui/stat-card";

// types
import type { ReactNode } from "react";

interface StatPairCardsProps {
  personalHeader: string;
  globalHeader: string;
  personal: ReactNode;
  global: ReactNode;
}

interface StatPairProps extends StatPairCardsProps {
  title: string;
}

// constants
const STAT_PAIR_GRID_CLASSES = cn("grid grid-cols-1 gap-4 sm:grid-cols-2 sm:grid-rows-[1fr_1fr] sm:gap-6");

function StatPairCards({ personalHeader, globalHeader, personal, global }: StatPairCardsProps) {
  const messages = useMessages();

  return (
    <article className={STAT_PAIR_GRID_CLASSES}>
      <StatCard Tag="header" variant="primary" title={messages(personalHeader)}>
        {personal}
      </StatCard>
      <StatCard Tag="footer" variant="secondary" title={messages(globalHeader)}>
        {global}
      </StatCard>
    </article>
  );
}

// Shared two-card layout for the scalar telemetry charts (counters and averages)
export function StatPair({ title, ...cards }: StatPairProps) {
  const messages = useMessages();

  return (
    <>
      <SectionHeader title={messages(title)} />
      <StatPairCards {...cards} />
    </>
  );
}

// Same chrome, placeholder content: the skeleton hands the pair two empty cards rather than rebuilding the grid under a non-animated heading
export function StatPairSkeleton({ title, ...cards }: Omit<StatPairProps, "personal" | "global">) {
  const messages = useMessages();

  return (
    <>
      <SectionHeaderSkeleton title={messages(title)} />
      <StatPairCards {...cards} personal={<StatCardValueSkeleton />} global={<StatCardValueSkeleton />} />
    </>
  );
}
