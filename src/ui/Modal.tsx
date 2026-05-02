import { useAtomValue, useAtomSet } from "@effect-atom/atom-react";
import { languageAtom } from "../atoms/languageAtom";
import { closeModalAction } from "../atoms/modalAtom";
import close from "../assets/close.svg";

interface ModalProps {
  title: string;
  children: React.ReactNode;
}

export default function Modal({ title, children }: ModalProps) {
  const language = useAtomValue(languageAtom);
  const closeModal = useAtomSet(closeModalAction);

  return (
    <aside className="bg-black/70 flex items-center justify-center fixed inset-0 z-50">
      <dialog open className="bg-[#c9b8c5] max-h-[80vh] overflow-auto text-[#333] rounded-lg p-4 mx-auto my-auto text-center shadow-lg block">
        <h1 className="text-xl p-0 border-b border-[#333] m-0 mb-5">{title}</h1>
        {children}
        <button
          type="button"
          className="mx-auto mt-8 flex gap-2 justify-center items-center"
          onClick={() => closeModal(undefined)}
        >
          <img src={close} className="w-4" alt="X" />
          {language === "en" ? "Close" : "Zamknij"}
        </button>
      </dialog>
    </aside>
  );
}
