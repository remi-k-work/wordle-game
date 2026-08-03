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
      <section className="flex items-center justify-center gap-2 bg-linear-to-b from-surface-1 via-surface-3 to-transparent">
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
                exit={{ opacity: 0, scale: 0, transition: { duration: motionTokens.duration.crawl, ease: motionTokens.easing.smooth } }}
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
      <section className="flex items-center justify-center gap-2 bg-linear-to-b from-surface-1 via-surface-3 to-transparent">
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
