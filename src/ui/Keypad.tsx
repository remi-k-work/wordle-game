// services, features, and other libraries
import { motion, AnimatePresence } from "motion/react";
import { useAtomValue, useAtomSet, Result, useAtomMount } from "@effect-atom/atom-react";
import { handleKeyAction, gameDataKeypadAtom, keypadColorsAtom } from "@/atoms";

// components
import LoadingStatus from "@/ui/LoadingStatus";

// assets
import backspace from "@/assets/backspace.svg";
import enter from "@/assets/enter.svg";

// types
import type { Color } from "@/domain";
import type { Transition } from "motion/react";

// constants
const COLOR_MAP = { grey: "#a1a1a1", green: "#5ac85a", yellow: "#e2cc68", red: "#c85a5a", "": "transparent" } as const satisfies Record<Color, string>;

const BASE_KEY_CLASS = "flex-[0_1_8cqi] text-[clamp(1em,0.8em+0.4cqi,1.25em)]";
const ICON_IMG_CLASS = "pointer-events-none mx-auto w-[clamp(1em,0.8em+0.4cqi,1.25em)]";

const SPRING_TRANSITION = { type: "spring", damping: 40, stiffness: 200 } as const satisfies Transition;

export default function Keypad() {
  useAtomMount(gameDataKeypadAtom);
  const gameDataKeypad = useAtomValue(gameDataKeypadAtom);
  const keypadColors = useAtomValue(keypadColorsAtom);
  const handleKey = useAtomSet(handleKeyAction);

  return Result.builder(gameDataKeypad)
    .onInitial(() => <LoadingStatus status="pending" />)
    .onWaiting(() => <LoadingStatus status="pending" />)
    .onFailure(() => <LoadingStatus status="rejected" />)
    .onSuccess((keys) => {
      // Dynamically filter out the grey keys
      const availableKeys = keys.filter((key) => keypadColors[key] !== "grey");

      return (
        <section className="@container flex h-full w-full flex-wrap justify-center gap-4">
          {/* AnimatePresence handles elements being unmounted (removed from the array) */}
          <AnimatePresence mode="sync">
            {availableKeys.map((key) => {
              const usedKeyColor = keypadColors[key];

              return (
                <motion.button
                  key={key}
                  layout
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0, transition: { duration: 3, ease: "easeOut" } }}
                  transition={SPRING_TRANSITION}
                  type="button"
                  className={BASE_KEY_CLASS}
                  style={{ backgroundColor: usedKeyColor ? COLOR_MAP[usedKeyColor] : COLOR_MAP[""] }}
                  onClick={() => handleKey(key)}
                >
                  {key}
                </motion.button>
              );
            })}

            {/* Always include Enter and Backspace, and make sure they animate alongside the letters */}
            <motion.button
              key="Backspace"
              layout
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={SPRING_TRANSITION}
              type="button"
              className={BASE_KEY_CLASS}
              onClick={() => handleKey("Backspace")}
            >
              <img src={backspace} className={ICON_IMG_CLASS} alt="⌫" />
            </motion.button>

            <motion.button
              key="Enter"
              layout
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={SPRING_TRANSITION}
              type="button"
              className={BASE_KEY_CLASS}
              onClick={() => handleKey("Enter")}
            >
              <img src={enter} className={ICON_IMG_CLASS} alt="⏎" />
            </motion.button>
          </AnimatePresence>
        </section>
      );
    })
    .render();
}
