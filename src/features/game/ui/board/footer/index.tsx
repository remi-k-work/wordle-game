// services, features, and other libraries
import { cn } from "@/lib/utils";
import { Option } from "effect";
import { useAtomValue } from "@effect/atom-react";
import { gameDataKeypadAtom } from "@/features/game/state/game-data";

// components
import { Toolbar, ToolbarSkeleton } from "./toolbar";
import { KeypadArea, KeypadAreaSkeleton } from "./keypad-area";

// constants
const FOOTER_CLASSES = cn("grid gap-1");

export function Footer() {
  const gameDataKeypad = useAtomValue(gameDataKeypadAtom);

  // Early return before any memo: the keyed area owns its own hooks
  if (Option.isNone(gameDataKeypad)) return <FooterSkeleton />;

  return (
    <footer className={FOOTER_CLASSES}>
      <Toolbar />
      <KeypadArea keys={gameDataKeypad.value} />
    </footer>
  );
}

export function FooterSkeleton() {
  return (
    <footer className={FOOTER_CLASSES}>
      <ToolbarSkeleton />
      <KeypadAreaSkeleton />
    </footer>
  );
}
