// next
import Image from "next/image";

// services, features, and other libraries
import { useAtomValue } from "@effect-atom/atom-react";
import { languageAtom } from "@/atoms";

// assets
import logo from "@/assets/opengraph-image.jpg";

export function Content() {
  const language = useAtomValue(languageAtom);

  const content =
    language === "En"
      ? {
          welcome:
            "Welcome to Wordle, a daily word game where you have six tries to guess a five-letter word. The game is simple and addictive, but it can also be challenging.",
          objective:
            "The objective of Wordle is to guess the secret five-letter word in as few attempts as possible. Each guess is made by typing a five-letter word into the provided field. Upon entering each guess, the game will provide feedback on the correctness of the letters entered, indicating whether they are in the correct position or not. This feedback is provided through a color-coding system:",
          green: "Indicates a correct letter in the correct position.",
          yellow: "Indicates a correct letter in the incorrect position.",
          grey: "Indicates a letter that is not in the word.",
          tip: "*Tip: When using a PC, you can type your guesses right on the keyboard.",
        }
      : {
          welcome:
            "Witamy w Wordle, codziennej grze słownej, w której masz sześć prób odgadnięcia pięcioliterowego słowa. Gra jest prosta i wciągająca, ale może też stanowić wyzwanie.",
          objective:
            "Celem gry Wordle jest odgadnięcie sekretnego pięcioliterowego słowa w jak najmniejszej liczbie prób. Każde odgadnięcie odbywa się poprzez wpisanie pięcioliterowego słowa w odpowiednim polu. Po wpisaniu każdego odgadnięcia gra wyświetli informację zwrotną na temat poprawności wpisanych liter, wskazując, czy znajdują się one na właściwym miejscu, czy też nie. Informacje zwrotne są przekazywane za pomocą systemu kodowania kolorami:",
          green: "Wskazuje prawidłową literę na właściwym miejscu.",
          yellow: "Wskazuje prawidłową literę na niewłaściwym miejscu.",
          grey: "Wskazuje literę, której nie ma w słowie.",
          tip: "*Wskazówka: Korzystając z komputera PC, możesz wpisywać swoje odgadnięcia bezpośrednio na klawiaturze.",
        };

  return (
    <article className="max-w-prose">
      <Image src={logo} className="mb-4 h-auto w-full" loading="lazy" alt="Logo" />

      <p className="my-4">{content.welcome}</p>
      <p className="my-4">{content.objective}</p>

      <ul className="mx-auto grid list-none place-content-center gap-2 text-start font-sans">
        <li className="flex items-center gap-2">
          <i className="block size-9 border bg-[#5ac85a]"></i>
          {content.green}
        </li>
        <li className="flex items-center gap-2">
          <i className="block size-9 border bg-[#e2cc68]"></i>
          {content.yellow}
        </li>
        <li className="flex items-center gap-2">
          <i className="block size-9 border bg-[#a1a1a1]"></i>
          {content.grey}
        </li>
      </ul>

      <p className="mx-auto mt-4 font-sans text-sm font-semibold">{content.tip}</p>
    </article>
  );
}
