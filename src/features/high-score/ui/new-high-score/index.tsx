"use client";

// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { highScoreMachineAtom } from "@/features/high-score/state";
import { motion, AnimatePresence } from "motion/react";

// components
import { Initials } from "./initials";

// assets
import { TrophyIcon } from "@heroicons/react/24/outline";

// constants
import { motionTokens, springs } from "@/lib/motion-tokens";

export function NewHighScore() {
  const highScoreMachineSnapshot = useAtomValue(highScoreMachineAtom);
  // The form is only visible when entering initials, submitting, or failing
  const isVisible = (["enteringInitials", "submitting", "failure"] as const).some((state) => highScoreMachineSnapshot.matches(state));

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.section
          className="grid place-items-center gap-4 rounded-md border-2 border-accent p-4"
          layout
          initial={{ opacity: 0, scale: motionTokens.scale.press, y: motionTokens.distance.sm }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: motionTokens.scale.press, y: motionTokens.distance.sm }}
          transition={springs.gentle}
        >
          <div className="flex items-center gap-2 text-accent">
            <TrophyIcon className="size-11" />
            <h3 className="font-sans text-2xl font-semibold tracking-widest text-accent uppercase sm:text-3xl">New High Score</h3>
          </div>
          <p>
            You qualified for the Top 10.
            <br />
            Enter your arcade initials:
          </p>
          <Initials />
        </motion.section>
      )}
    </AnimatePresence>
  );
}
