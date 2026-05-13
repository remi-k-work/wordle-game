// services, features, and other libraries
import { useAtomValue, useAtomSet } from "@effect-atom/atom-react";
import { closeModalAction, languageAtom } from "@/atoms";

// components
import { Button } from "@base-ui/react/button";

// assets
import { XCircleIcon } from "@heroicons/react/24/outline";

// types
import type { ReactNode } from "react";

interface ModalProps {
  title: string;
  children: ReactNode;
}

export function Modal({ title, children }: ModalProps) {
  const language = useAtomValue(languageAtom);
  const closeModal = useAtomSet(closeModalAction);

  return (
    <aside className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <dialog open className="mx-auto my-auto block max-h-[80dvh] overflow-auto bg-surface-1 p-3 text-center text-text-1 shadow-lg">
        <h1 className="mb-5 max-w-none bg-linear-to-b from-surface-1 via-surface-3 to-surface-1 p-2 font-sans text-4xl tracking-widest text-text-2 uppercase">
          {title}
        </h1>
        {children}
        <Button className="button mx-auto mt-8" onClick={() => closeModal()}>
          <XCircleIcon className="size-11" />
          {language === "En" ? "Close" : "Zamknij"}
        </Button>
      </dialog>
    </aside>
  );
}
