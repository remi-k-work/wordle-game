"use client";

// services, features, and other libraries
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";

// assets
import { InformationCircleIcon } from "@heroicons/react/24/outline";

// types
import type { ReactNode } from "react";

interface InfoLineProps {
  message?: ReactNode;
  className?: string;
}

// constants
import { motionTokens, springs } from "@/lib/motion-tokens";

export function InfoLine({ message, className }: InfoLineProps) {
  return (
    <AnimatePresence>
      {message && (
        <motion.p
          role="status"
          aria-live="polite"
          className={cn("mb-4 flex max-w-none items-center justify-center gap-2 border px-6 py-9 text-xl", className)}
          layout
          initial={{ opacity: 0, scale: motionTokens.scale.press, y: motionTokens.distance.sm }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: motionTokens.scale.press, y: motionTokens.distance.sm }}
          transition={springs.gentle}
        >
          <InformationCircleIcon className="size-11 flex-none" />
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}
