// services, features, and other libraries
import { motion, AnimatePresence } from "motion/react";
import { useAtomValue, useAtomSet, Result, useAtomMount } from "@effect-atom/atom-react";
import { handleKeyAction, gameDataKeypadAtom, keypadColorsAtom } from "@/atoms";

// components
import { Button } from "@base-ui/react";
import { Loading } from "@/ui/Loading";

// assets
import { BackspaceIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";

// types
import type { Color } from "@/domain";
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
  useAtomMount(gameDataKeypadAtom);
  const gameDataKeypad = useAtomValue(gameDataKeypadAtom);
  const keypadColors = useAtomValue(keypadColorsAtom);
  const handleKey = useAtomSet(handleKeyAction);

  return Result.builder(gameDataKeypad)
    .onInitial(() => <Loading status="pending" />)
    .onWaiting(() => <Loading status="pending" />)
    .onFailure(() => <Loading status="rejected" />)
    .onSuccess((keys) => {
      // Dynamically filter out the grey keys
      const availableKeys = keys.filter((key) => keypadColors[key] !== "grey");

      return (
        <footer className="mx-auto flex max-w-3xl flex-wrap justify-center gap-1">
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
                  className="button flex-[0_1_3rem] border-secondary text-center font-sans text-xl"
                  style={{ backgroundColor: usedKeyColor ? COLOR_MAP[usedKeyColor] : COLOR_MAP[""] }}
                  onClick={() => handleKey(key)}
                >
                  {key}
                </MotionButton>
              );
            })}

            {/* Always include Enter and Backspace, and make sure they animate alongside the letters */}
            <MotionButton
              key="Backspace"
              layout
              transition={SPRING_TRANSITION}
              className="button flex-[0_1_3rem] bg-secondary px-2 py-1"
              onClick={() => handleKey("Backspace")}
            >
              <BackspaceIcon className="size-9" />
            </MotionButton>

            <MotionButton
              key="Enter"
              layout
              transition={SPRING_TRANSITION}
              className="button flex-[0_1_3rem] bg-secondary px-2 py-1"
              onClick={() => handleKey("Enter")}
            >
              <PaperAirplaneIcon className="size-9" />
            </MotionButton>
          </AnimatePresence>
        </footer>
      );
    })
    .render();
}
