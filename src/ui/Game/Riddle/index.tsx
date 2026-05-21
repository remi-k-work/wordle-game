// services, features, and other libraries
import { cn } from "@/lib/utils";
import { Result, useAtomValue } from "@effect-atom/atom-react";
import { riddleAtom } from "@/atoms";

// components
import { Button, Popover } from "@base-ui/react";

// assets
import { SpinnerIcon } from "@/assets/icons";
import { SparklesIcon } from "@heroicons/react/24/outline";

export function Riddle() {
  const riddle = useAtomValue(riddleAtom);

  return (
    <Popover.Root>
      <Popover.Trigger openOnHover title="Riddle" className="button flex-none p-1 data-popup-open:bg-accent">
        {Result.isWaiting(riddle) ? <SpinnerIcon className="size-11" /> : <SparklesIcon className="size-11" />}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={8}>
          <Popover.Popup
            className={cn(
              "grid gap-3 rounded-md bg-surface-2 p-3 text-center text-xl shadow-sm",
              "transition duration-300 ease-in-out",
              "origin-(--transform-origin)",
              "data-ending-style:scale-90 data-ending-style:opacity-0 data-starting-style:scale-90 data-starting-style:opacity-0"
            )}
          >
            {Result.builder(riddle)
              .onInitialOrWaiting(() => <p className="animate-pulse">Thinking...</p>)
              .onFailure(() => <p>Riddle unavailable. You are on your own!</p>)
              .onSuccess((riddle) => <p>{riddle}</p>)
              .render()}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

export function RiddleSkeleton() {
  return (
    <Button className="button flex-none p-1" disabled>
      <SparklesIcon className="size-11" />
    </Button>
  );
}
