// next
import Image from "next/image";

// services, features, and other libraries
import { T } from "gt-next";

// components
import { CloseModalButton } from "@/ui/modal-close-button";

// assets
import hero from "@/assets/hero.webp";

export function Content() {
  return (
    <article className="mx-auto max-w-prose space-y-9">
      <Image src={hero} loading="eager" alt="Wordle Overdrive" className="mx-auto h-auto w-full max-w-384" />

      <T>
        <p>
          Welcome to <b>Wordle Overdrive</b>, a daily word game where you have six tries to guess a five-letter word. The game is simple and addictive, but it
          can also be challenging.
        </p>
      </T>
      <T>
        <p>
          The objective of <b>Wordle Overdrive</b> is to guess the secret five-letter word in as few attempts as possible. Each guess is made by typing a
          five-letter word into the provided field. Upon entering each guess, the game will provide feedback on the correctness of the letters entered,
          indicating whether they are in the correct position or not. This feedback is provided through a color system:
        </p>
      </T>

      <ul className="grid list-none place-content-center gap-2 text-start font-sans">
        <li className="flex items-center gap-2">
          <span className="inline-block size-9 flex-none border bg-tile-green">&nbsp;</span>
          <T>Indicates a correct letter in the correct position.</T>
        </li>
        <li className="flex items-center gap-2">
          <span className="inline-block size-9 flex-none border bg-tile-yellow">&nbsp;</span>
          <T>Indicates a correct letter in the incorrect position.</T>
        </li>
        <li className="flex items-center gap-2">
          <span className="inline-block size-9 flex-none border bg-tile-grey">&nbsp;</span>
          <T>Indicates a letter that is not in the word.</T>
        </li>
      </ul>

      <footer className="mx-auto mt-4 font-sans text-sm font-semibold">
        <T>*Tip: When using a PC, you can type your guesses right on the keyboard.</T>
      </footer>

      <CloseModalButton />
    </article>
  );
}
