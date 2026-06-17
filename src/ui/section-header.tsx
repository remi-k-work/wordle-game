// services, features, and other libraries
import { cn } from "@/lib/utils";

// types
import type { ReactNode } from "react";

interface SectionHeaderProps {
  title: string | ReactNode;
}

export function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <>
      <h2 className={cn("my-8 bg-linear-to-r from-secondary to-surface-1 p-3 font-sans text-lg", "sm:text-2xl lg:text-3xl")}>{title}</h2>
    </>
  );
}
