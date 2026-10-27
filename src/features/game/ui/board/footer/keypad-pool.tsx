// services, features, and other libraries
import { cn } from "@/lib/utils";
import { AnimatePresence } from "motion/react";

// components
import { Button } from "@base-ui/react/button";
import { KeypadKey, KeypadKeySkeleton } from "./keypad-key";

// assets
import { BackspaceIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";

// types
import type { Color } from "@/features/game/domain/models";

export interface KeypadPoolEntry {
  letter: string;
  color: Color;
}

interface KeypadPoolProps {
  keys: ReadonlyArray<KeypadPoolEntry>;
  onPressed: (pressedKey: string) => void;
}

// constants
import { ALPHABET } from "@/features/game/ui/board/constants";

export function KeypadPool({ keys, onPressed }: KeypadPoolProps) {
  return (
    <div className="flex flex-wrap justify-center gap-1 [grid-area:pool]">
      <AnimatePresence mode="sync">
        {keys.map(({ letter, color }) => (
          <KeypadKey key={letter} letter={letter} color={color} onPressed={onPressed} />
        ))}
      </AnimatePresence>
      <Button tabIndex={-1} className={cn("button min-h-9.5 flex-initial basis-12 bg-destructive p-0", "md:hidden")} onClick={() => onPressed("BACKSPACE")}>
        <BackspaceIcon className="size-8" />
      </Button>
      <Button tabIndex={-1} className={cn("button min-h-9.5 flex-initial basis-12 bg-secondary p-0", "md:hidden")} onClick={() => onPressed("ENTER")}>
        <PaperAirplaneIcon className="size-8" />
      </Button>
    </div>
  );
}

export function KeypadPoolSkeleton() {
  return (
    <div className="flex flex-wrap justify-center gap-1 [grid-area:pool]">
      {ALPHABET.map((letter) => (
        <KeypadKeySkeleton key={letter} letter={letter} />
      ))}
      <Button tabIndex={-1} className={cn("button min-h-9.5 flex-initial basis-12 bg-destructive p-0", "md:hidden")} disabled>
        <BackspaceIcon className="size-8" />
      </Button>
      <Button tabIndex={-1} className={cn("button min-h-9.5 flex-initial basis-12 bg-secondary p-0", "md:hidden")} disabled>
        <PaperAirplaneIcon className="size-8" />
      </Button>
    </div>
  );
}
