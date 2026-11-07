// services, features, and other libraries
import { cn } from "@/lib/utils";

// types
import type { ReactNode } from "react";

// constants
const SLIDE_CLASS = cn("min-w-0 shrink-0 grow-0 basis-full ps-4 [&>h2]:m-0 [&>h2]:mb-6 [&>h2]:max-w-none");

// One slide of the totals carousel
export function Slide({ children }: { children: () => ReactNode }) {
  return <div className={SLIDE_CLASS}>{children()}</div>;
}
