// services, features, and other libraries
import { Option } from "effect";
import { motion, AnimatePresence } from "motion/react";
import { useAtomSet, useAtomValue } from "@effect/atom-react";
import { gameDataKeypadAtom, keypadColorsAtom, wordChallengeMachineAtom } from "@/features/game/state";

// components
import { Button } from "@base-ui/react";

// assets
import { BackspaceIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";

// types
import type { Color } from "@/features/game/domain";
import type { Transition } from "motion/react";

// constants
const COLOR_MAP = {
  grey: "var(--color-tile-grey)",
  yellow: "var(--color-tile-yellow)",
  green: "var(--color-tile-green)",
  red: "var(--color-destructive)",
  "": "transparent",
} as const satisfies Record<Color, string>;
const SPRING_TRANSITION = { type: "spring", damping: 40, stiffness: 200 } as const satisfies Transition;

const MotionButton = motion.create(Button);

export function Footer() {
  const gameDataKeypad = useAtomValue(gameDataKeypadAtom);
  const keypadColors = useAtomValue(keypadColorsAtom);
  const wordChallengeMachineEvent = useAtomSet(wordChallengeMachineAtom);

  if (Option.isNone(gameDataKeypad)) return <FooterSkeleton />;

  // Dynamically filter out the grey keys
  const availableKeys = gameDataKeypad.value.filter((key) => keypadColors[key] !== "grey");

  return (
    <footer className="mx-auto flex max-w-3xl flex-wrap justify-center gap-1 rounded-md bg-surface-3 p-1">
      {/* AnimatePresence handles elements being unmounted (removed from the array) */}
      <AnimatePresence mode="sync">
        {availableKeys.map((key) => {
          const usedKeyColor = keypadColors[key];

          return (
            <MotionButton
              key={key}
              layout
              exit={{ opacity: 0, scale: 0, transition: { duration: 3, ease: "easeOut" } }}
              transition={SPRING_TRANSITION}
              className="button basis-12 border-secondary p-0 font-sans text-xl leading-9"
              style={{ backgroundColor: usedKeyColor ? COLOR_MAP[usedKeyColor] : COLOR_MAP[""] }}
              onClick={() => wordChallengeMachineEvent({ type: "keyPressed", pressedKey: key })}
            >
              {key}
            </MotionButton>
          );
        })}

        {/* Always include BACKSPACE and ENTER, and make sure they animate alongside the letters */}
        <MotionButton
          key="Backspace"
          layout
          transition={SPRING_TRANSITION}
          className="button basis-12 bg-secondary p-0"
          onClick={() => wordChallengeMachineEvent({ type: "keyPressed", pressedKey: "BACKSPACE" })}
        >
          <BackspaceIcon className="size-7" />
        </MotionButton>

        <MotionButton
          key="Enter"
          layout
          transition={SPRING_TRANSITION}
          className="button basis-12 bg-secondary p-0"
          onClick={() => wordChallengeMachineEvent({ type: "keyPressed", pressedKey: "ENTER" })}
        >
          <PaperAirplaneIcon className="size-7" />
        </MotionButton>
      </AnimatePresence>
    </footer>
  );
}

export function FooterSkeleton() {
  return (
    <footer className="mx-auto flex max-w-3xl flex-wrap justify-center gap-1 rounded-md bg-surface-3 p-1">
      {["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"].map((key) => (
        <Button key={key} className="button basis-12 border-secondary bg-transparent p-0 font-sans text-xl leading-9" disabled>
          {key}
        </Button>
      ))}
      <Button className="button basis-12 bg-secondary p-0" disabled>
        <BackspaceIcon className="size-7" />
      </Button>
      <Button className="button basis-12 bg-secondary p-0" disabled>
        <PaperAirplaneIcon className="size-7" />
      </Button>
    </footer>
  );
}
