// types
import type { ReactNode } from "react";

interface HackCostBadgeProps {
  children: ReactNode;
}

export function HackCostBadge({ children }: HackCostBadgeProps) {
  return <span className="rounded-md bg-destructive px-3 py-2 font-sans text-text-2">{children}</span>;
}
