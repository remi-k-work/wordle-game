// services, features, and other libraries
import { Option } from "effect";
import { motion, AnimatePresence } from "motion/react";
import { useAtomSet, useAtomValue } from "@effect/atom-react";
import { gameDataKeypadAtom } from "@/features/game/state";
import { overdriveHacksKeypadColorsAtom, overdriveHacksMachineAtom } from "@/features/overdrive-hacks/state";

// components
import { Button } from "@base-ui/react";
import { HacksMenu, HacksMenuSkeleton } from "@/features/overdrive-hacks/ui/hacks-menu";
import { Riddle, RiddleSkeleton } from "@/features/game/ui/riddle";
import { LangChanger, LangChangerSkeleton } from "@/features/settings/ui/lang-changer";
import { GameFlowButton, GameFlowButtonSkeleton } from "@/features/game/ui/flow-button";

// assets
import { BackspaceIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";

// types
import type { Color } from "@/features/game/domain";

// constants
import { motionTokens } from "@/lib/motion-tokens";

const COLOR_MAP = {
  grey: "var(--color-tile-grey)",
  yellow: "var(--color-tile-yellow)",
  green: "var(--color-tile-green)",
  red: "var(--color-destructive)",
  "": "transparent",
} as const satisfies Record<Color, string>;

// EMP "electrical fry" exit — jitter, flicker, glow, and burn out
const EMP_FRY_EXIT = {
  x: [0, -8, 12, -14, 10, -7, 3, 0],
  y: [0, 2, -3, 4, -2, 3, -1, 0],
  scale: [1, 1.18, 0.96, 1.12, 0.82, 1.05, 0.35, 0],
  opacity: [1, 0.25, 1, 0.15, 0.85, 0.35, 0.5, 0],
  rotate: [0, -20, 28, -24, 18, -12, 6, 0],
  boxShadow: [
    "0 0 0px transparent",
    "0 0 18px var(--color-destructive)",
    "0 0 5px var(--color-destructive)",
    "0 0 24px var(--color-destructive)",
    "0 0 8px var(--color-destructive)",
    "0 0 18px var(--color-destructive)",
    "0 0 30px var(--color-destructive)",
    "0 0 0px transparent",
  ],
  transition: {
    duration: motionTokens.duration.crawl * 6,
    ease: motionTokens.easing.sharp,
  },
};

const MotionButton = motion.create(Button);

export function Footer() {
  const gameDataKeypad = useAtomValue(gameDataKeypadAtom);
  const keypadColors = useAtomValue(overdriveHacksKeypadColorsAtom);
  const overdriveHacksMachineEvent = useAtomSet(overdriveHacksMachineAtom);

  if (Option.isNone(gameDataKeypad)) return <FooterSkeleton />;

  // Dynamically filter out the grey keys
  const availableKeys = gameDataKeypad.value.filter((key) => keypadColors[key] !== "grey");

  return (
    <footer className="grid gap-1">
      <section className="grid grid-cols-[1fr_1fr_2fr_3fr] gap-2 bg-linear-to-b from-surface-1 via-surface-3 to-transparent">
        <HacksMenu />
        <Riddle mode="popover" />
        <LangChanger />
        <GameFlowButton />
      </section>

      <section className="mx-auto flex max-w-3xl flex-wrap justify-center gap-1 rounded-md bg-surface-3 p-1">
        {/* AnimatePresence handles elements being unmounted (removed from the array) */}
        <AnimatePresence mode="sync">
          {availableKeys.map((key) => {
            const usedKeyColor = keypadColors[key];

            return (
              <MotionButton
                key={key}
                exit={EMP_FRY_EXIT}
                className="button basis-12 border-secondary p-0 font-sans text-xl leading-9"
                style={{ backgroundColor: usedKeyColor ? COLOR_MAP[usedKeyColor] : COLOR_MAP[""] }}
                onClick={() => overdriveHacksMachineEvent({ type: "input.keyPressed", pressedKey: key })}
              >
                {key}
              </MotionButton>
            );
          })}

          {/* Always include BACKSPACE and ENTER, and make sure they animate alongside the letters */}
          <MotionButton
            key="Backspace"
            className="button basis-12 bg-secondary p-0"
            onClick={() => overdriveHacksMachineEvent({ type: "input.keyPressed", pressedKey: "BACKSPACE" })}
          >
            <BackspaceIcon className="size-7" />
          </MotionButton>

          <MotionButton
            key="Enter"
            className="button basis-12 bg-secondary p-0"
            onClick={() => overdriveHacksMachineEvent({ type: "input.keyPressed", pressedKey: "ENTER" })}
          >
            <PaperAirplaneIcon className="size-7" />
          </MotionButton>
        </AnimatePresence>
      </section>
    </footer>
  );
}

export function FooterSkeleton() {
  return (
    <footer className="grid gap-1">
      <section className="grid grid-cols-[1fr_1fr_2fr_3fr] gap-2 bg-linear-to-b from-surface-1 via-surface-3 to-transparent">
        <HacksMenuSkeleton />
        <RiddleSkeleton mode="popover" />
        <LangChangerSkeleton />
        <GameFlowButtonSkeleton />
      </section>

      <section className="mx-auto flex max-w-3xl flex-wrap justify-center gap-1 rounded-md bg-surface-3 p-1">
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
      </section>
    </footer>
  );
}
