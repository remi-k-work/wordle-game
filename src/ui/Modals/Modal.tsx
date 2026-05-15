// services, features, and other libraries
import { cn } from "@/lib/utils";
import { useAtomSet } from "@effect-atom/atom-react";
import { closeModalAction } from "@/atoms";

// components
import { Button, Dialog } from "@base-ui/react";

// assets
import { XCircleIcon } from "@heroicons/react/24/outline";

// types
import type { ReactNode } from "react";

interface ModalProps {
  isOpen?: boolean;
  title: string;
  children: ReactNode;
}

export function Modal({ isOpen = false, title, children }: ModalProps) {
  const closeModal = useAtomSet(closeModalAction);

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <Dialog.Portal>
        <Dialog.Backdrop
          className={cn(
            "fixed inset-0 bg-black opacity-90",
            "transition-opacity duration-300 ease-in-out",
            "data-ending-style:opacity-0 data-starting-style:opacity-0",
            "supports-[-webkit-touch-callout:none]:absolute"
          )}
        />
        <Dialog.Viewport className="fixed inset-0 flex items-center justify-center overflow-hidden">
          <Dialog.Popup
            className={cn(
              "relative max-h-[80dvh] overflow-auto bg-surface-1 p-3 text-center text-text-1",
              "transition duration-300 ease-in-out",
              "data-ending-style:scale-90 data-ending-style:opacity-0 data-starting-style:scale-90 data-starting-style:opacity-0"
            )}
          >
            <h1 className="mb-5 max-w-none bg-linear-to-b from-surface-1 via-surface-3 to-surface-1 p-2 font-sans text-4xl tracking-widest text-text-2 uppercase">
              {title}
            </h1>
            {children}
            <Button className="button mx-auto mt-8" tabIndex={-1} onClick={() => closeModal()}>
              <XCircleIcon className="size-11" />
              Close
            </Button>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
