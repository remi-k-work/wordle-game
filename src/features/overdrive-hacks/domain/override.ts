// services, features, and other libraries
import { Context, Effect, Match, Option } from "effect";
import { AiSdkError, generateSingleField, makeGeminiFallbackPlan } from "@/domain";
import { formatGuess, matchLanguage } from "@/features/game/domain";

// types
import type { Color, SolutionsLanguage, TheSecretWord, WordChallenge, WordMeta } from "@/features/game/domain";
import type { LanguageModel } from "ai";

// constants
const SYSTEM_PROMPT_EN = (theSecretWord: TheSecretWord) => `
You are an elite analytical AI assistant in a high-stakes word puzzle game. The player has spent valuable resources to summon you for a premium lifeline.
The secret word is "${theSecretWord}". 

CRITICAL RULES:
1. Provide a highly insightful, contextual clue about the secret word's meaning, category, or usage.
2. NEVER reveal the secret word directly. Do not use its root, derivatives, or rhyming giveaways.
3. Be highly descriptive and creative. Make it suitable for Text-To-Speech (plain text, no Markdown, no emojis).
4. Do not include any preamble, greetings, or meta-talk (e.g., "Here is a clue"). Output ONLY the clue.
5. SELF-VERIFY before outputting: Ensure the word "${theSecretWord}" is completely absent from your response.

EXAMPLE OF EXPECTED OUTPUT TONE AND FORMAT:
Context: Secret word is "CLOCK". Player guessed "BRICK" (C yellow, K green).
Clue: You correctly identified the letter K at the end, and you know there is a C somewhere in the mix. While your guess is a building material, you need to shift your focus to everyday mechanisms. Think about devices usually mounted on a wall or worn on a wrist that help us measure the passage of time.
`;
const SYSTEM_PROMPT_PL = (theSecretWord: TheSecretWord) => `
Jesteś elitarnym analitycznym asystentem AI w grze słownej o wysoką stawkę. Gracz wydał cenne zasoby, aby wezwać Cię jako koło ratunkowe premium.
Ukryte słowo to "${theSecretWord}".

ZASADY KRYTYCZNE:
1. Podaj niezwykle wnikliwą, trafną wskazówkę dotyczącą znaczenia, kategorii lub użycia ukrytego słowa.
2. NIGDY nie ujawniaj wprost ukrytego słowa. Nie używaj jego form pokrewnych, rdzeni ani rymów. Pamiętaj o polskiej odmianie (przypadki, liczba mnoga).
3. Bądź bardzo opisowy i kreatywny. Tekst musi być przyjazny dla Text-To-Speech (zwykły tekst, bez Markdowna, bez emotikonów).
4. Nie używaj wstępów, powitań ani metakomentarzy (np. "Oto wskazówka"). Wypisz TYLKO wskazówkę.
5. SAMOWERYFIKACJA przed odpowiedzią: Upewnij się, że słowo "${theSecretWord}" (w żadnej formie) nie pojawia się w Twojej odpowiedzi.

PRZYKŁAD OCZEKIWANEGO TONU I FORMATU ODPOWIEDZI:
Kontekst: Ukryte słowo to "ZEGAR". Gracz wpisał "PASEK" (E żółty, A żółty).
Wskazówka: Znalazłeś właściwe litery E oraz A, ale znajdują się one na złych pozycjach. Twój strzał dotyczy elementu garderoby, jednak musisz szukać w zupełnie innej kategorii. Zastanów się nad powszechnie używanymi urządzeniami, które często wiszą na ścianie i służą do odmierzania upływającego czasu.
`;

const buildFeedbackLines = (
  wordleGuesses: WordChallenge["wordleGuesses"],
  theSecretWord: TheSecretWord,
  colorToString: (color: Color) => string = (color) => color
) =>
  wordleGuesses.map((guess, i) => {
    const feedbackString = formatGuess(theSecretWord, guess)
      .map((t) => `${t.tileKey} ${colorToString(t.color)}`)
      .join(", ");
    return `${i + 1}. ${guess} -> ${feedbackString}\n`;
  });

const OVERRIDE_PROMPT_EN = (
  theSecretWord: TheSecretWord,
  wordDefinition: WordMeta["wordDefinition"],
  theRiddle: WordMeta["theRiddle"],
  wordleGuesses: WordChallenge["wordleGuesses"]
) =>
  [
    `Craft the override clue now based on the following context:\n\n`,
    Option.match(wordDefinition, {
      onSome: (value) =>
        `Official dictionary meaning for reference: "${value}".\n-> Use this to understand the exact context, but DO NOT copy it verbatim.\n\n`,
      onNone: () => "",
    }),
    Option.match(theRiddle, {
      onSome: (value) =>
        `The player already has this cryptic riddle: "${value}".\n-> Provide a useful delta. Do not repeat the same imagery, phrasing, or tropes.\n\n`,
      onNone: () => "",
    }),
    wordleGuesses.length === 0
      ? `The player has not made any guesses yet (Turn 1).\n-> Provide a concrete, descriptive real-world category, origin, or general domain where this word is encountered to give them a strong starting point.\n\n`
      : `The player's attempts and Wordle color feedback (green=correct spot, yellow=wrong spot, grey=not in word):\n${buildFeedbackLines(wordleGuesses, theSecretWord).join("")}\n-> Step 1: Assess whether their guesses are close in meaning or structure using the color feedback.\n-> Step 2: Tailor your detailed clue to course-correct them. Provide a direct semantic clue (e.g., real-world usage, synonym, or shared trait) that bridges the gap between their closest guess and the secret word.\n\n`,
  ].join("");

const OVERRIDE_PROMPT_PL = (
  theSecretWord: TheSecretWord,
  wordDefinition: WordMeta["wordDefinition"],
  theRiddle: WordMeta["theRiddle"],
  wordleGuesses: WordChallenge["wordleGuesses"]
) => {
  // Map English domain colors to Polish for the prompt context
  const colorToPl = (color: Color) =>
    Match.value(color).pipe(
      Match.when("green", () => "zielony"),
      Match.when("yellow", () => "żółty"),
      Match.when("grey", () => "szary"),
      Match.orElse((s) => s)
    );

  return [
    `Stwórz wskazówkę ratunkową teraz, w oparciu o poniższy kontekst:\n\n`,
    Option.match(wordDefinition, {
      onSome: (value) =>
        `Oficjalna definicja słownikowa do wglądu: "${value}".\n-> Użyj jej, aby zrozumieć dokładny kontekst, ale NIE kopiuj jej dosłownie.\n\n`,
      onNone: () => "",
    }),
    Option.match(theRiddle, {
      onSome: (value) =>
        `Gracz dysponuje już tą zagadką: "${value}".\n-> Zapewnij nową wartość. Nie powtarzaj tych samych skojarzeń, sformułowań ani motywów.\n\n`,
      onNone: () => "",
    }),
    wordleGuesses.length === 0
      ? `Gracz nie wypróbował jeszcze żadnych słów (pierwsza tura).\n-> Podaj opisową, konkretną kategorię z prawdziwego świata, pochodzenie lub ogólną dziedzinę, w której występuje to słowo, aby dać mu mocny punkt wyjścia.\n\n`
      : `Próby gracza i informacja zwrotna z kolorami (zielony=dobre miejsce, żółty=złe miejsce, szary=brak w słowie):\n${buildFeedbackLines(wordleGuesses, theSecretWord, colorToPl).join("")}\n-> Krok 1: Oceń, czy ich próby są bliskie znaczeniowo lub strukturalnie, używając informacji o kolorach.\n-> Krok 2: Dostosuj swoją szczegółową wskazówkę, aby nakierować ich na właściwy tor. Podaj bezpośrednią wskazówkę semantyczną (np. zastosowanie w życiu codziennym, synonim), która połączy ich najbliższy domysł z ukrytym słowem.\n\n`,
  ].join("");
};

// Override model as a typed dependency (a service)
const OverrideModel = Context.Service<LanguageModel>("OverrideModel");

// Attempt to generate an override using the provided model
const attemptOverrideWithModel = Effect.fn("attemptOverrideWithModel")(function* (
  theSecretWord: TheSecretWord,
  wordDefinition: WordMeta["wordDefinition"],
  theRiddle: WordMeta["theRiddle"],
  wordleGuesses: WordChallenge["wordleGuesses"],
  solutionsLanguage: SolutionsLanguage
): Effect.fn.Return<Option.Option<string>, AiSdkError, LanguageModel> {
  const model = yield* OverrideModel;

  return yield* generateSingleField(model, {
    temperature: 0.5,
    instructions: matchLanguage(solutionsLanguage, SYSTEM_PROMPT_EN(theSecretWord), SYSTEM_PROMPT_PL(theSecretWord)),
    prompt: matchLanguage(
      solutionsLanguage,
      OVERRIDE_PROMPT_EN(theSecretWord, wordDefinition, theRiddle, wordleGuesses),
      OVERRIDE_PROMPT_PL(theSecretWord, wordDefinition, theRiddle, wordleGuesses)
    ),
    fieldName: "clue",
    description: matchLanguage(
      solutionsLanguage,
      "The highly descriptive clue in plain text only. Detailed, insightful, TTS-friendly. No Markdown, emojis, or preamble.",
      "Niezwykle wnikliwa i opisowa wskazówka wyłącznie w postaci zwykłego tekstu. Szczegółowa, przyjazna dla TTS. Bez Markdownu, emotikonów i wstępów."
    ),
  }).pipe(Effect.map((clue) => Option.some(clue)));
});

const OverridePlan = makeGeminiFallbackPlan(OverrideModel);

export const generateOverride = (
  theSecretWord: TheSecretWord,
  wordDefinition: WordMeta["wordDefinition"],
  theRiddle: WordMeta["theRiddle"],
  wordleGuesses: WordChallenge["wordleGuesses"],
  solutionsLanguage: SolutionsLanguage
) => attemptOverrideWithModel(theSecretWord, wordDefinition, theRiddle, wordleGuesses, solutionsLanguage).pipe(Effect.withExecutionPlan(OverridePlan));
