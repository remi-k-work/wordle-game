// services, features, and other libraries
import { cn } from "@/lib/utils";

// components
import { Popover } from "@base-ui/react";

// types
import type { ReactNode } from "react";

interface GamePopoverProps {
  title: string;
  trigger: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  wide?: boolean;
}

// constants
const POPOVER_POPUP_CLASSES = cn(
  "grid gap-3 rounded-md bg-surface-2 p-3 shadow-sm",
  "transition duration-300 ease-in-out",
  "origin-(--transform-origin)",
  "data-ending-style:scale-90 data-ending-style:opacity-0 data-starting-style:scale-90 data-starting-style:opacity-0"
);

// Shared popover chrome for the in-game toolbar (hacks menu, riddle, game
// menu). Keeps trigger hover behavior, positioning, and enter/exit styling
// identical without copy-pasting Portal/Positioner/Popup scaffolding.
export function GamePopover({ title, trigger, open, onOpenChange, children, wide = false }: GamePopoverProps) {
  return (
    <Popover.Root open={open} onOpenChange={onOpenChange}>
      <Popover.Trigger openOnHover title={title} className="button flex-none p-1 data-popup-open:bg-accent">
        {trigger}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={8}>
          <Popover.Popup className={cn(POPOVER_POPUP_CLASSES, wide && "max-w-[90dvw]")}>{children}</Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
