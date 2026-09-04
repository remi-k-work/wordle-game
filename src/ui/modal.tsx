// services, features, and other libraries
import { useAtomSet } from "@effect/atom-react";
import { modalMachineAtom } from "@/state";

// components
import { Dialog } from "@base-ui/react";
import { RevealTitle } from "@/ui/reveal-title";

// types
import type { ReactNode } from "react";

interface ModalProps {
  isOpen?: boolean;
  title: string;
  children: ReactNode;
}

// constants
import { DIALOG_BACKDROP_CLASSES, DIALOG_POPUP_CLASSES, DIALOG_TITLE_CLASSES, DIALOG_VIEWPORT_CLASSES } from "@/ui/dialog-chrome";

export function Modal({ isOpen = false, title, children }: ModalProps) {
  const modalMachineEvent = useAtomSet(modalMachineAtom);

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && modalMachineEvent({ type: "closed" })}>
      <Dialog.Portal>
        <Dialog.Backdrop className={DIALOG_BACKDROP_CLASSES} />
        <Dialog.Viewport className={DIALOG_VIEWPORT_CLASSES}>
          <Dialog.Popup className={DIALOG_POPUP_CLASSES}>
            <RevealTitle className={DIALOG_TITLE_CLASSES} title={title} unit="char" />
            {children}
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
