// services, features, and other libraries
import { motion } from "motion/react";

// types
interface RevealTitleProps {
  className?: string;
  title: string;
  unit?: "word" | "char";
}

// constants
import { MOTION_TOKENS, SPRINGS } from "@/lib/motion-tokens";

const CONTAINER_VARIANTS = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: MOTION_TOKENS.duration.fast } },
} as const;

const SEGMENT_VARIANTS = {
  hidden: { opacity: 0, y: "100%" },
  visible: { opacity: 1, y: 0, transition: SPRINGS.gentle },
} as const;

const MotionH1 = motion.create("h1");

// Hoisted so they are compiled once instead of per render (js-hoist-regexp)
const WORD_SPLIT_RE = /(\s+)/;
const WHITESPACE_RE = /^\s+$/;

// Every title in the app is the page's own `h1` (the page header and the dialog title)
export function RevealTitle({ className, title, unit = "word" }: RevealTitleProps) {
  const segments = unit === "char" ? Array.from(title) : title.split(WORD_SPLIT_RE);

  return (
    <MotionH1 className={className} variants={CONTAINER_VARIANTS} initial="hidden" animate="visible" aria-label={title}>
      {segments.map((segment, index) =>
        WHITESPACE_RE.test(segment) ? (
          <span key={index} aria-hidden="true">
            {segment}
          </span>
        ) : (
          <motion.span key={index} className="inline-block" variants={SEGMENT_VARIANTS} aria-hidden="true">
            {segment}
          </motion.span>
        )
      )}
    </MotionH1>
  );
}
