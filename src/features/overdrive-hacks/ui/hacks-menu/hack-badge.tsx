// services, features, and other libraries
import { cn } from "@/lib/utils";

// types
import type { ReactNode } from "react";

interface HackBadgeProps {
  tone: keyof typeof HACK_BADGE_TONES;
  children: ReactNode;
}

// constants
const HACK_BADGE_TONES = {
  cost: cn("rounded-md bg-destructive px-3 py-2 font-sans text-text-2"),
  ready: cn("rounded-md bg-tile-green px-3 py-2 font-sans text-text-2"),
} as const;

// The trailing chip of a hacks-menu row; every row ends in one — a price to pay
// or a state already reached — so the shape is stated once and each row only
// supplies its tone and its content
export function HackBadge({ tone, children }: HackBadgeProps) {
  return <span className={HACK_BADGE_TONES[tone]}>{children}</span>;
}
