// services, features, and other libraries
import { cn } from "@/lib/utils";

// types
import type { ReactNode } from "react";

interface BestRunCardFrameProps {
  Tag?: "header" | "footer" | "section" | "div" | "article";
  variant: "primary" | "secondary";
  title: string;
  children: ReactNode;
}

// constants
const VARIANT_STYLES = {
  primary: "border-primary text-primary",
  secondary: "border-secondary text-secondary",
} as const;

export function BestRunCardFrame({ Tag = "section", variant, title, children }: BestRunCardFrameProps) {
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
      {children}
    </Tag>
  );
}
