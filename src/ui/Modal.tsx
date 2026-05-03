import { useAtomValue, useAtomSet } from "@effect-atom/atom-react";
import { languageAtom } from "@/atoms/languageAtom";
import { closeModalAction } from "@/atoms/modalAtom";
import close from "@/assets/close.svg";

interface ModalProps {
  title: string;
  children: React.ReactNode;
}

export default function Modal({ title, children }: ModalProps) {
  const language = useAtomValue(languageAtom);
  const closeModal = useAtomSet(closeModalAction);

  return (
    <aside className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <dialog open className="mx-auto my-auto block max-h-[80vh] overflow-auto rounded-lg bg-[#c9b8c5] p-4 text-center text-[#333] shadow-lg">
        <h1 className="m-0 mb-5 border-b border-[#333] p-0 text-xl">{title}</h1>
        {children}
        <button type="button" className="mx-auto mt-8 flex items-center justify-center gap-2" onClick={() => closeModal(undefined)}>
          <img src={close} className="w-4" alt="X" />
          {language === "en" ? "Close" : "Zamknij"}
        </button>
      </dialog>
    </aside>
  );
}
