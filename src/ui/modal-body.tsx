// components
import { CloseModalButton } from "@/ui/modal-close-button";

// types
import type { ReactNode } from "react";

// What a modal wraps its content in: a centred, measure-limited column that ends in the one button that dismisses the dialog
export function ModalBody({ children }: { children: ReactNode }) {
  return (
    <article className="mx-auto max-w-prose space-y-9">
      {children}
      <CloseModalButton />
    </article>
  );
}
