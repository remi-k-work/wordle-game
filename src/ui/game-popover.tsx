// react
import { useState } from "react";

// services, features, and other libraries
import { cn } from "@/lib/utils";

// components
import { Button } from "@base-ui/react/button";
import { Popover } from "@base-ui/react/popover";

// types
import type { ComponentType, ReactNode } from "react";

interface GamePopoverProps {
  title: string;
  trigger: ReactNode;
  children: (close: () => void) => ReactNode;
  wide?: boolean;
}

// constants
const POPOVER_POPUP_CLASSES = cn(
  "grid gap-3 rounded-md bg-surface-2 p-3 shadow-sm",
  "transition duration-300 ease-in-out",
  "origin-(--transform-origin)",
  "data-ending-style:scale-90 data-ending-style:opacity-0 data-starting-style:scale-90 data-starting-style:opacity-0"
);
const POPOVER_TRIGGER_CLASSES = cn("button flex-none p-1");
const POPOVER_TRIGGER_LIVE_CLASSES = cn(POPOVER_TRIGGER_CLASSES, "data-popup-open:bg-accent");

// Shared popover chrome for the in-game toolbar (hacks menu, riddle, game menu)
export function GamePopover({ title, trigger, children, wide = false }: GamePopoverProps) {
  const [isOpen, setIsOpen] = useState(false);

  const close = () => setIsOpen(false);

  return (
    <Popover.Root open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
      <Popover.Trigger openOnHover title={title} className={POPOVER_TRIGGER_LIVE_CLASSES}>
        {trigger}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={8}>
          <Popover.Popup className={cn(POPOVER_POPUP_CLASSES, wide && "max-w-[90dvw]")}>{children(close)}</Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

// The loading state of any `GamePopover` trigger: a disabled button in the live
// trigger's chrome, holding the icon the live trigger holds while the popover's
// content is in flight
export function PopoverTriggerSkeleton({ Icon }: { Icon: ComponentType<{ className?: string }> }) {
  return (
    <Button className={POPOVER_TRIGGER_CLASSES} disabled>
      <Icon className="size-11" />
    </Button>
  );
}
