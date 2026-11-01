// types
import type { ReactNode } from "react";

interface SlideProps {
  index: number;
  selectedIndex: number;
  skeleton: ReactNode;
  children: ReactNode;
}

// constants
export const SLIDE_CLASS = "min-w-0 shrink-0 grow-0 basis-full ps-4 [&>h2]:m-0 [&>h2]:mb-6 [&>h2]:max-w-none";

export function Slide({ index, selectedIndex, skeleton, children }: SlideProps) {
  const isActive = index === selectedIndex;

  return <div className={SLIDE_CLASS}>{isActive ? children : skeleton}</div>;
}
