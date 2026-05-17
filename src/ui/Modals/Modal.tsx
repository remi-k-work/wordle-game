// services, features, and other libraries
import { cn } from "@/lib/utils";
import { useAtomSet } from "@effect-atom/atom-react";
import { closeModalAction } from "@/atoms";

// components
import { Dialog } from "@base-ui/react";

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
            <h1 className="mb-5 max-w-none bg-linear-to-r from-surface-1 via-surface-3 to-surface-1 p-2 font-sans text-4xl tracking-widest text-text-2 uppercase">
              {title}
            </h1>
            {children}
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
