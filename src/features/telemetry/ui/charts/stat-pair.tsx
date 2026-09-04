// components
import { T, useMessages } from "gt-next";
import { SectionHeader, SectionHeaderSkeleton } from "@/ui/section-header";
import { StatCard, StatCardSkeleton } from "@/ui/stat-card";

// types
import type { ReactNode } from "react";

interface StatPairProps {
  title: string;
  personalHeader: string;
  personal: ReactNode;
  globalTitle: ReactNode;
  global: ReactNode;
}

// Shared two-card layout for the scalar telemetry charts (counters and
// averages). Formatting stays with callers; only the grid chrome is shared.
export function StatPair({ title, personalHeader, personal, globalTitle, global }: StatPairProps) {
  const messages = useMessages();

  return (
    <>
      <SectionHeader title={messages(title)} />
      <article className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:grid-rows-[1fr_1fr] sm:gap-6">
        <StatCard Tag="header" variant="primary" title={messages(personalHeader)}>
          {personal}
        </StatCard>
        <StatCard Tag="footer" variant="secondary" title={globalTitle}>
          {global}
        </StatCard>
      </article>
    </>
  );
}

export function StatPairSkeleton({ title, personalHeader, globalTitle }: Pick<StatPairProps, "title" | "personalHeader"> & { globalTitle?: ReactNode }) {
  const messages = useMessages();

  return (
    <>
      <SectionHeaderSkeleton title={messages(title)} />
      <article className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:grid-rows-[1fr_1fr] sm:gap-6">
        <StatCard Tag="header" variant="primary" title={messages(personalHeader)}>
          <StatCardSkeleton />
        </StatCard>
        <StatCard Tag="footer" variant="secondary" title={globalTitle ?? <T>Global Total</T>}>
          <StatCardSkeleton />
        </StatCard>
      </article>
    </>
  );
}
