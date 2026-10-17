// services, features, and other libraries
import { cn } from "@/lib/utils";

// types
import type { ReactNode } from "react";

interface StatCardProps {
  Tag?: "header" | "footer" | "section" | "div" | "article";
  variant: "primary" | "secondary";
  title: ReactNode;
  children: ReactNode;
}

// constants
const VARIANT_STYLES = {
  primary: "border-primary text-primary",
  secondary: "border-secondary text-secondary",
} as const;

// Fully static portion of the card chrome, hoisted so each card render only
// merges the two-argument variant override
const CARD_CLASS = "row-span-2 grid grid-rows-subgrid gap-3 rounded-xl border-2 bg-surface-1 p-3 text-center md:p-6 lg:p-9 w-3/4 max-w-lg justify-self-center";

export function StatCard({ Tag = "section", variant, title, children }: StatCardProps) {
  return (
    <Tag className={cn(CARD_CLASS, VARIANT_STYLES[variant])}>
      {/* self-center perfectly vertically aligns the title in its 1fr track */}
      <div className="@container self-center">
        <h3 className="text-[6cqi] font-semibold tracking-widest uppercase">{title}</h3>
      </div>
      {/* self-center perfectly vertically aligns the title in its 1fr track */}
      <div className="@container self-center">
        <span className="text-[14cqi] font-semibold wrap-anywhere">{children}</span>
      </div>
    </Tag>
  );
}

export function StatCardSkeleton() {
  return <span className="inline-block w-full">&nbsp;</span>;
}
