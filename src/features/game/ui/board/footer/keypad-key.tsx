// react
import { memo } from "react";

// services, features, and other libraries
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

// Memoized leaf: Each key only re-renders when its own color/handler identity actually changes
export const KeypadKey = memo(function KeypadKey({ letter, color, onPressed }: KeypadKeyProps) {
  return (
    <MotionButton
      exit={EMP_FRY_EXIT}
      className="button flex-initial basis-12 border-secondary p-0 font-sans text-xl leading-9"
      style={{ backgroundColor: KEYPAD_COLOR_MAP[color] }}
      onClick={() => onPressed(letter)}
    >
      {letter}
    </MotionButton>
  );
});

export function KeypadKeySkeleton({ letter }: Pick<KeypadKeyProps, "letter">) {
  return (
    <Button className="button flex-initial basis-12 border-secondary bg-transparent p-0 font-sans text-xl leading-9" disabled>
      {letter}
    </Button>
  );
}
