// services, features, and other libraries
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

// assets
import { InformationCircleIcon } from "@heroicons/react/24/outline";

// types
import type { ReactNode } from "react";

interface InfoLineProps {
  // Every caller has a reason to show (an empty chart, a list with no rows yet),
  // so "no message at all" is not part of this component's contract: the callers
  // that have nothing to say swap the whole subtree instead
  message: ReactNode;
  className?: string;
}

// constants
import { MOTION_TOKENS, SPRINGS } from "@/lib/motion-tokens";

// A single status line, announced politely. It used to sit inside an
// `AnimatePresence` with a `message ? … : null` branch: no caller ever rendered
// it without a message, and an unkeyed child that never leaves cannot animate an
// exit, so the presence wrapper only implied a transition that never ran
export function InfoLine({ message, className }: InfoLineProps) {
  return (
    <motion.p
      role="status"
      aria-live="polite"
      className={cn("mb-4 flex max-w-none items-center justify-center gap-2 border px-6 py-9 text-xl", className)}
      initial={{ opacity: 0, scale: MOTION_TOKENS.scale.press, y: MOTION_TOKENS.distance.sm }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={SPRINGS.gentle}
    >
      <InformationCircleIcon className="size-11 flex-none" />
      {message}
    </motion.p>
  );
}
