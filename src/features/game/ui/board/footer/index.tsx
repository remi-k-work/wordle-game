// services, features, and other libraries
import { Option } from "effect";
import { useAtomValue } from "@effect/atom-react";
import { gameDataKeypadAtom } from "@/features/game/state/game-data";

// components
import { Toolbar, ToolbarSkeleton } from "./toolbar";
import { KeypadArea, KeypadAreaSkeleton } from "./keypad-area";

// constants
// Fully static class string, hoisted so the live footer and its skeleton cannot
// drift into different outer spacing (matching `HEADER_CLASSES` / `TOOLBAR_CLASSES`)
const FOOTER_CLASSES = "grid gap-1";

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
