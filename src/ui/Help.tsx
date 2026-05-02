import { useAtomValue } from "@effect-atom/atom-react";
import { languageAtom } from "../atoms/languageAtom";
import logo from "../assets/opengraph-image.jpg";

export default function Help() {
  const language = useAtomValue(languageAtom);

  const content = language === "en" ? {
    welcome: "Welcome to Wordle, a daily word game where you have six tries to guess a five-letter word. The game is simple and addictive, but it can also be challenging.",
    objective: "The objective of Wordle is to guess the secret five-letter word in as few attempts as possible. Each guess is made by typing a five-letter word into the provided field. Upon entering each guess, the game will provide feedback on the correctness of the letters entered, indicating whether they are in the correct position or not. This feedback is provided through a color-coding system:",
    green: "Indicates a correct letter in the correct position.",
    yellow: "Indicates a correct letter in the incorrect position.",
    grey: "Indicates a letter that is not in the word.",
    tip: "*Tip: When using a PC, you can type your guesses right on the keyboard."
  } : {
    welcome: "Witamy w Wordle, codziennej grze słownej, w której masz sześć prób odgadnięcia pięcioliterowego słowa. Gra jest prosta i wciągająca, ale może też stanowić wyzwanie.",
    objective: "Celem gry Wordle jest odgadnięcie sekretnego pięcioliterowego słowa w jak najmniejszej liczbie prób. Każde odgadnięcie odbywa się poprzez wpisanie pięcioliterowego słowa w odpowiednim polu. Po wpisaniu każdego odgadnięcia gra wyświetli informację zwrotną na temat poprawności wpisanych liter, wskazując, czy znajdują się one na właściwym miejscu, czy też nie. Informacje zwrotne są przekazywane za pomocą systemu kodowania kolorami:",
    green: "Wskazuje prawidłową literę na właściwym miejscu.",
    yellow: "Wskazuje prawidłową literę na niewłaściwym miejscu.",
    grey: "Wskazuje literę, której nie ma w słowie.",
    tip: "*Wskazówka: Korzystając z komputera PC, możesz wpisywać swoje odgadnięcia bezpośrednio na klawiaturze."
  };

  return (
    <article className="max-w-[65ch] text-justify">
      <img src={logo} className="w-full h-auto mb-4" loading="lazy" alt="Logo" />

      <p className="my-4">{content.welcome}</p>
      <p className="my-4">{content.objective}</p>
      
      <ul className="max-w-[45ch] text-start mx-auto list-none p-0">
        <li className="flex gap-2 justify-start items-center mb-2">
          <i className="block bg-[#5ac85a] rounded-sm border border-[#333] w-4 h-4"></i>
          <span>{content.green}</span>
        </li>
        <li className="flex gap-2 justify-start items-center mb-2">
          <i className="block bg-[#e2cc68] rounded-sm border border-[#333] w-4 h-4"></i>
          <span>{content.yellow}</span>
        </li>
        <li className="flex gap-2 justify-start items-center mb-2">
          <i className="block bg-[#a1a1a1] rounded-sm border border-[#333] w-4 h-4"></i>
          <span>{content.grey}</span>
        </li>
      </ul>
      
      <p className="text-center text-sm font-bold text-[#333] mt-4">
        {content.tip}
      </p>
    </article>
  );
}
