// services, features, and other libraries
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

// types
interface SectionHeaderProps {
  // Already-translated display text: the header is purely presentational, so
  // callers decide how to resolve it (raw `msg()` ids in routes, `messages()`
  // in chart modules). Both the live header and its skeleton share that one
  // contract instead of one of them translating behind the caller's back
  title: string;
}

// constants
import { motionTokens, springs } from "@/lib/motion-tokens";

const SECTION_HEADER_CLASSES = cn("my-8 bg-linear-to-r from-secondary to-surface-1 p-3 font-sans text-lg", "sm:text-2xl lg:text-3xl");

export function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <motion.h2
      initial={{ opacity: 0, y: motionTokens.distance.md }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={springs.gentle}
      className={SECTION_HEADER_CLASSES}
    >
      {title}
    </motion.h2>
  );
}

export function SectionHeaderSkeleton({ title }: SectionHeaderProps) {
  return <h2 className={SECTION_HEADER_CLASSES}>{title}</h2>;
}
