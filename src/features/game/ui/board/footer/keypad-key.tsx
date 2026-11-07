// react
import { memo } from "react";

// services, features, and other libraries
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

// components
import { Button } from "@base-ui/react/button";

// types
import type { Color } from "@/features/game/domain/models";

interface KeypadKeyProps {
  letter: string;
  color: Color;
  onPressed: (pressedKey: string) => void;
}

// constants
import { EMP_FRY_EXIT, KEYPAD_COLOR_MAP } from "@/features/game/ui/board/constants";

const MotionButton = motion.create(Button);

// Fully static class string, hoisted so the live key and its skeleton cannot drift
// into different key sizes or type: a change to the pool's flex-wrap layout has to
// apply to both at once, or the keyboard visibly reshuffles when data lands
const KEY_CLASSES = "button flex-initial basis-12 border-secondary p-0 font-sans text-xl leading-9";

// Memoized leaf: Each key only re-renders when its own color/handler identity actually changes
export const KeypadKey = memo(function KeypadKey({ letter, color, onPressed }: KeypadKeyProps) {
  return (
    <MotionButton exit={EMP_FRY_EXIT} className={KEY_CLASSES} style={{ backgroundColor: KEYPAD_COLOR_MAP[color] }} onClick={() => onPressed(letter)}>
      {letter}
    </MotionButton>
  );
});

export function KeypadKeySkeleton({ letter }: Pick<KeypadKeyProps, "letter">) {
  return (
    <Button className={cn(KEY_CLASSES, "bg-transparent")} disabled>
      {letter}
    </Button>
  );
}
