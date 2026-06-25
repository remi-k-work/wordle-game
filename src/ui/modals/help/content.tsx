// next
import Image from "next/image";

// services, features, and other libraries
import { useAtomSet } from "@effect/atom-react";
import { modalMachineAtom } from "@/features/game/state";

// components
import { Button } from "@base-ui/react";

// assets
import hero from "@/assets/hero.webp";
import { XCircleIcon } from "@heroicons/react/24/outline";

export function Content() {
  const modalMachineEvent = useAtomSet(modalMachineAtom);

  return (
    <article className="mx-auto max-w-prose space-y-9">
      <Image src={hero} loading="eager" alt="Wordle Overdrive" className="mx-auto h-auto w-full max-w-384" />

      <p>
        Welcome to <b>Wordle Overdrive</b>, a daily word game where you have six tries to guess a five-letter word. The game is simple and addictive, but it can
        also be challenging.
      </p>
      <p>
        The objective of <b>Wordle Overdrive</b> is to guess the secret five-letter word in as few attempts as possible. Each guess is made by typing a
        five-letter word into the provided field. Upon entering each guess, the game will provide feedback on the correctness of the letters entered, indicating
        whether they are in the correct position or not. This feedback is provided through a color-coding system:
      </p>

      <ul className="mx-auto grid list-none place-content-center gap-2 text-start font-sans">
        <li className="flex items-center gap-2">
          <i className="block size-9 border bg-tile-green"></i>
          Indicates a correct letter in the correct position.
        </li>
        <li className="flex items-center gap-2">
          <i className="block size-9 border bg-tile-yellow"></i>
          Indicates a correct letter in the incorrect position.
        </li>
        <li className="flex items-center gap-2">
          <i className="block size-9 border bg-tile-grey"></i>
          Indicates a letter that is not in the word.
        </li>
      </ul>

      <footer className="mx-auto mt-4 font-sans text-sm font-semibold">*Tip: When using a PC, you can type your guesses right on the keyboard.</footer>

      <Button tabIndex={-1} className="button mx-auto mt-8" onClick={() => modalMachineEvent({ type: "modal.closed" })}>
        <XCircleIcon className="size-11" />
        Close
      </Button>
    </article>
  );
}
