// services, features, and other libraries
import { Context, Effect, ExecutionPlan, Layer, Option, Schedule } from "effect";
import { generateText, Output } from "ai";
import { google } from "@ai-sdk/google";
import { AiSdkError } from "@/domain";
import { z } from "zod";
import { formatGuess } from "@/features/game/domain";

// types
import type { SolutionsLanguage, TheSecretWord, WordChallenge, WordMeta } from "@/features/game/domain";
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
const OVERRIDE_PROMPT_EN = (
  theSecretWord: TheSecretWord,
  wordDefinition: WordMeta["wordDefinition"],
  theRiddle: WordMeta["theRiddle"],
  wordleGuesses: WordChallenge["wordleGuesses"]
) => {
  let prompt = `Craft the override clue now based on the following context:\n\n`;

  if (Option.isSome(wordDefinition)) {
    prompt += `Official dictionary meaning for reference: "${wordDefinition.value}".\n`;
    prompt += `-> Use this to understand the exact context, but DO NOT copy it verbatim.\n\n`;
  }

  if (Option.isSome(theRiddle)) {
    prompt += `The player already has this cryptic riddle: "${theRiddle.value}".\n`;
    prompt += `-> Provide a useful delta. Do not repeat the same imagery, phrasing, or tropes.\n\n`;
  }

  if (wordleGuesses.length === 0) {
    prompt += `The player has not made any guesses yet (Turn 1).\n`;
    prompt += `-> Provide a concrete, descriptive real-world category, origin, or general domain where this word is encountered to give them a strong starting point.\n\n`;
  } else {
    prompt += `The player's attempts and Wordle color feedback (green=correct spot, yellow=wrong spot, grey=not in word):\n`;

    // Dynamically calculate the feedback colors using formatGuess
    wordleGuesses.forEach((guess, i) => {
      const tiles = formatGuess(theSecretWord, guess);
      const feedbackString = tiles.map((t) => `${t.tileKey} ${t.color}`).join(", ");
      prompt += `${i + 1}. ${guess} -> ${feedbackString}\n`;
    });

    prompt += `\n-> Step 1: Assess whether their guesses are close in meaning or structure using the color feedback.\n`;
    prompt += `-> Step 2: Tailor your detailed clue to course-correct them. Provide a direct semantic clue (e.g., real-world usage, synonym, or shared trait) that bridges the gap between their closest guess and the secret word.\n\n`;
  }

  return prompt;
};

const OVERRIDE_PROMPT_PL = (
  theSecretWord: TheSecretWord,
  wordDefinition: WordMeta["wordDefinition"],
  theRiddle: WordMeta["theRiddle"],
  wordleGuesses: WordChallenge["wordleGuesses"]
) => {
  let prompt = `Stwórz wskazówkę ratunkową teraz, w oparciu o poniższy kontekst:\n\n`;

  if (Option.isSome(wordDefinition)) {
    prompt += `Oficjalna definicja słownikowa do wglądu: "${wordDefinition.value}".\n`;
    prompt += `-> Użyj jej, aby zrozumieć dokładny kontekst, ale NIE kopiuj jej dosłownie.\n\n`;
  }

  if (Option.isSome(theRiddle)) {
    prompt += `Gracz dysponuje już tą zagadką: "${theRiddle.value}".\n`;
    prompt += `-> Zapewnij nową wartość. Nie powtarzaj tych samych skojarzeń, sformułowań ani motywów.\n\n`;
  }

  if (wordleGuesses.length === 0) {
    prompt += `Gracz nie wypróbował jeszcze żadnych słów (pierwsza tura).\n`;
    prompt += `-> Podaj opisową, konkretną kategorię z prawdziwego świata, pochodzenie lub ogólną dziedzinę, w której występuje to słowo, aby dać mu mocny punkt wyjścia.\n\n`;
  } else {
    prompt += `Próby gracza i informacja zwrotna z kolorami (zielony=dobre miejsce, żółty=złe miejsce, szary=brak w słowie):\n`;

    // Map English domain colors to Polish for the prompt context
    const colorToPl: Record<string, string> = { green: "zielony", yellow: "żółty", grey: "szary" };

    // Dynamically calculate the feedback colors using formatGuess
    wordleGuesses.forEach((guess, i) => {
      const tiles = formatGuess(theSecretWord, guess);
      const feedbackString = tiles.map((t) => `${t.tileKey} ${colorToPl[t.color] ?? t.color}`).join(", ");
      prompt += `${i + 1}. ${guess} -> ${feedbackString}\n`;
    });

    prompt += `\n-> Krok 1: Oceń, czy ich próby są bliskie znaczeniowo lub strukturalnie, używając informacji o kolorach.\n`;
    prompt += `-> Krok 2: Dostosuj swoją szczegółową wskazówkę, aby nakierować ich na właściwy tor. Podaj bezpośrednią wskazówkę semantyczną (np. zastosowanie w życiu codziennym, synonim), która połączy ich najbliższy domysł z ukrytym słowem.\n\n`;
  }

  return prompt;
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
) {
  const model = yield* OverrideModel;

  return yield* Effect.tryPromise({
    try: () =>
      generateText({
        model,
        temperature: 0.5,
        instructions: solutionsLanguage === "En" ? SYSTEM_PROMPT_EN(theSecretWord) : SYSTEM_PROMPT_PL(theSecretWord),
        prompt:
          solutionsLanguage === "En"
            ? OVERRIDE_PROMPT_EN(theSecretWord, wordDefinition, theRiddle, wordleGuesses)
            : OVERRIDE_PROMPT_PL(theSecretWord, wordDefinition, theRiddle, wordleGuesses),
        maxRetries: 0,
        output: Output.object({
          schema: z.object({
            clue: z
              .string()
              .trim()
              .describe(
                solutionsLanguage === "En"
                  ? "The highly descriptive clue in plain text only. Detailed, insightful, TTS-friendly. No Markdown, emojis, or preamble."
                  : "Niezwykle wnikliwa i opisowa wskazówka wyłącznie w postaci zwykłego tekstu. Szczegółowa, przyjazna dla TTS. Bez Markdownu, emotikonów i wstępów."
              ),
          }),
        }),
      }),
    catch: (cause) => new AiSdkError({ message: `The attempt to generate an override using the "${model}" model was unsuccessful.`, cause }),
  }).pipe(Effect.map(({ output }) => Option.some(output.clue)));
});

const OverridePlan = ExecutionPlan.make(
  { provide: Layer.succeed(OverrideModel, google("gemini-3.5-flash-lite")), attempts: 2, schedule: Schedule.exponential("1 second", 2) },
  { provide: Layer.succeed(OverrideModel, google("gemini-3.1-flash-lite")), attempts: 2, schedule: Schedule.exponential("1 second", 2) },
  { provide: Layer.succeed(OverrideModel, google("gemini-2.5-flash-lite")), attempts: 2, schedule: Schedule.exponential("1 second", 2) }
);

export const generateOverride = (
  theSecretWord: TheSecretWord,
  wordDefinition: WordMeta["wordDefinition"],
  theRiddle: WordMeta["theRiddle"],
  wordleGuesses: WordChallenge["wordleGuesses"],
  solutionsLanguage: SolutionsLanguage
) => attemptOverrideWithModel(theSecretWord, wordDefinition, theRiddle, wordleGuesses, solutionsLanguage).pipe(Effect.withExecutionPlan(OverridePlan));
