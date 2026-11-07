// services, features, and other libraries
import { cn } from "@/lib/utils";

// types
import type { CardTag, CardVariant } from "@/ui/card-variants";
import type { ReactNode } from "react";

interface BestRunCardFrameProps {
  Tag?: CardTag;
  variant: CardVariant;
  title: string;
  children: ReactNode;
}

// constants
import { CARD_VARIANT_STYLES } from "@/ui/card-variants";

export function BestRunCardFrame({ Tag = "section", variant, title, children }: BestRunCardFrameProps) {
  return (
    <Tag
      className={cn(
        "row-span-7 grid grid-rows-subgrid font-semibold",
        "rounded-xl border-2 text-center",
        "w-3/4 max-w-lg place-items-center justify-self-center",
        CARD_VARIANT_STYLES[variant]
      )}
    >
      <h3 className="tracking-widest uppercase">{title}</h3>
      {children}
    </Tag>
  );
}
