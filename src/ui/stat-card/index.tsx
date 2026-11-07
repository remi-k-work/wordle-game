// services, features, and other libraries
import { cn } from "@/lib/utils";

// components
import { CARD_VARIANT_STYLES } from "@/ui/card-variants";

// types
import type { CardTag, CardVariant } from "@/ui/card-variants";
import type { ReactNode } from "react";

interface StatCardProps {
  Tag?: CardTag;
  variant: CardVariant;
  title: ReactNode;
  children: ReactNode;
}

// constants
// Fully static portion of the card chrome, hoisted so each card render only merges the two-argument variant override
const CARD_CLASS = cn(
  "row-span-2 grid w-3/4 max-w-lg grid-rows-subgrid gap-3 justify-self-center rounded-xl border-2 bg-surface-1 p-3 text-center md:p-6 lg:p-9"
);

export function StatCard({ Tag = "section", variant, title, children }: StatCardProps) {
  return (
    <Tag className={cn(CARD_CLASS, CARD_VARIANT_STYLES[variant])}>
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

// The placeholder for a card's value, not for the card
export function StatCardValueSkeleton() {
  return <span className="inline-block w-full">&nbsp;</span>;
}
