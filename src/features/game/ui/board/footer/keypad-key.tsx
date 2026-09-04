// react
import { memo } from "react";

// services, features, and other libraries
import { motion } from "motion/react";

// components
import { Button } from "@base-ui/react";

// types
import type { Color } from "@/features/game/domain";

interface KeypadKeyProps {
  pressKey: string;
  keyColor: Color | null;
  onPressed: (pressedKey: string) => void;
}

// constants
import { EMP_FRY_EXIT, KEYPAD_COLOR_MAP } from "@/features/game/ui/board/constants";

const MotionButton = motion.create(Button);

// Memoized leaf: Each key only re-renders when its own color/handler identity actually changes
export const KeypadKey = memo(function KeypadKey({ pressKey, keyColor, onPressed }: KeypadKeyProps) {
  return (
    <MotionButton
      key={pressKey}
      exit={EMP_FRY_EXIT}
      className="button flex-initial basis-12 border-secondary p-0 font-sans text-xl leading-9"
      style={{ backgroundColor: keyColor ? KEYPAD_COLOR_MAP[keyColor] : KEYPAD_COLOR_MAP[""] }}
      onClick={() => onPressed(pressKey)}
    >
      {pressKey}
    </MotionButton>
  );
});

export function KeypadKeySkeleton({ pressKey }: Pick<KeypadKeyProps, "pressKey">) {
  return (
    <Button className="button flex-initial basis-12 border-secondary bg-transparent p-0 font-sans text-xl leading-9" disabled>
      {pressKey}
    </Button>
  );
}
