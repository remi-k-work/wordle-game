// services, features, and other libraries
import { Context, Effect } from "effect";
import { matchLanguage } from ".";
import { AiSdkError, generateSingleField, makeGeminiFallbackPlan } from "@/domain";

// types
import type { SolutionsLanguage, TheSecretWord } from ".";
import type { LanguageModel } from "ai";

// constants
const SYSTEM_PROMPT_EN = (theSecretWord: TheSecretWord) => `
You are a witty puzzle master for an arcade word game.
The secret word for this riddle is "${theSecretWord}".

CRITICAL RULES:
1. Write a short, engaging riddle (1 to 3 sentences) that ends in a question (e.g., "What am I?").
2. Reference at least one concrete real-world domain, function, or associated object so a player can logically guess it.
3. NEVER reveal the secret word directly. Do not use its root, derivatives, or rhyming giveaways.
4. Keep it plain text, suitable for Text-To-Speech (no Markdown, emojis, or formatting).
5. Do not include any preamble or meta-talk. Output ONLY the riddle.
6. SELF-VERIFY: Ensure the word "${theSecretWord}" is completely absent.

EXAMPLE TONE AND FORMAT:
Context: Secret word is "MIRROR"
Riddle: I can show you the world, but I have no eyes. I reflect your every move but have no mind of my own. What am I?
`;
const SYSTEM_PROMPT_PL = (theSecretWord: TheSecretWord) => `
Jesteś błyskotliwym mistrzem łamigłówek w zręcznościowej grze słownej.
Ukryte słowo dla tej zagadki to "${theSecretWord}".

ZASADY KRYTYCZNE:
1. Napisz krótką, wciągającą zagadkę (od 1 do 3 zdań), która kończy się pytaniem (np. "Czym jestem?").
2. Odnieś się do co najmniej jednej konkretnej dziedziny, funkcji lub przedmiotu z prawdziwego świata, aby gracz mógł logicznie odgadnąć słowo.
3. NIGDY nie ujawniaj wprost ukrytego słowa. Nie używaj jego form pokrewnych, rdzeni ani rymów. Zwróć szczególną uwagę na polską odmianę (przypadki, liczba mnoga).
4. Tekst musi być zwykły i przyjazny dla Text-To-Speech (bez Markdowna, emotikonów i formatowania).
5. Nie używaj wstępów ani metakomentarzy. Wypisz TYLKO zagadkę.
6. SAMOWERYFIKACJA: Upewnij się, że słowo "${theSecretWord}" (w żadnej formie) nie pojawia się w tekście.

PRZYKŁAD TONU I FORMATU:
Kontekst: Ukryte słowo to "LUSTRO"
Zagadka: Mogę ukazać ci świat, chociaż nie mam oczu. Powielam każdy twój ruch, lecz nie mam własnego umysłu. Czym jestem?
`;
const RIDDLE_PROMPT_EN = "Craft the riddle now.";
const RIDDLE_PROMPT_PL = "Stwórz zagadkę teraz.";

// Riddle model as a typed dependency (a service)
const RiddleModel = Context.Service<LanguageModel>("RiddleModel");

// Attempt to generate a riddle using the provided model
const attemptRiddleWithModel = Effect.fn("attemptRiddleWithModel")(function* (
  theSecretWord: TheSecretWord,
  solutionsLanguage: SolutionsLanguage
): Effect.fn.Return<string, AiSdkError, LanguageModel> {
  const model = yield* RiddleModel;

  return yield* generateSingleField(model, {
    temperature: 0.9,
    instructions: matchLanguage(solutionsLanguage, SYSTEM_PROMPT_EN(theSecretWord), SYSTEM_PROMPT_PL(theSecretWord)),
    prompt: matchLanguage(solutionsLanguage, RIDDLE_PROMPT_EN, RIDDLE_PROMPT_PL),
    fieldName: "riddle",
    description: matchLanguage(
      solutionsLanguage,
      "Plain prose, a short riddle (1-3 sentences) ending in a question, TTS-friendly. No Markdown or emojis.",
      "Zwykły tekst, krótka zagadka (1-3 zdania) zakończona pytaniem, przyjazna dla TTS. Bez Markdownu i emotikonów."
    ),
  });
});

const RiddlePlan = makeGeminiFallbackPlan(RiddleModel);

export const generateRiddle = (theSecretWord: TheSecretWord, solutionsLanguage: SolutionsLanguage) =>
  attemptRiddleWithModel(theSecretWord, solutionsLanguage).pipe(Effect.withExecutionPlan(RiddlePlan));
