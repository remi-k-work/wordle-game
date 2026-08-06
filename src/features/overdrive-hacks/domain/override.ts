// services, features, and other libraries
import { Context, Effect, ExecutionPlan, Layer, Option, Schedule } from "effect";
import { generateText, Output } from "ai";
import { google } from "@ai-sdk/google";
import { AiSdkError } from "@/domain";
import { z } from "zod";

// types
import type { SolutionsLanguage, TheSecretWord, WordChallenge, WordMeta } from "@/features/game/domain";
import type { LanguageModel } from "ai";

// constants
const SYSTEM_PROMPT_EN =
  "You are an elite analytical AI assistant in a high-stakes word puzzle game. The player has just spent their most valuable resources to summon you for a premium lifeline. Provide a highly insightful, contextual clue about the secret word's meaning, category, or usage. Do not reveal the secret word directly.";
const SYSTEM_PROMPT_PL =
  "Jesteś elitarnym analitycznym asystentem AI w grze słownej o wysoką stawkę. Gracz właśnie wydał swoje najcenniejsze zasoby, aby wezwać Cię jako koło ratunkowe premium. Podaj niezwykle wnikliwą, trafną wskazówkę dotyczącą znaczenia, kategorii lub użycia ukrytego słowa. Nie ujawniaj wprost ukrytego słowa.";
const OVERRIDE_PROMPT_EN = (
  theSecretWord: TheSecretWord,
  wordDefinition: WordMeta["wordDefinition"],
  theRiddle: WordMeta["theRiddle"],
  wordleGuesses: WordChallenge["wordleGuesses"]
) => {
  let prompt = `The secret word is "${theSecretWord}".\n\n`;

  if (Option.isSome(wordDefinition)) {
    prompt += `Official dictionary meaning for reference: "${wordDefinition.value}".\n`;
    prompt += `-> Use this to understand the exact context, but DO NOT copy it verbatim.\n\n`;
  }

  if (Option.isSome(theRiddle)) {
    prompt += `The player already has this cryptic riddle: "${theRiddle.value}".\n`;
    prompt += `-> Do not repeat the same imagery, phrasing, or tropes.\n\n`;
  }

  if (wordleGuesses.length === 0) {
    prompt += `The player has not made any guesses yet (Turn 1).\n`;
    prompt += `-> Provide a broad, foundational clue (e.g., a primary category, origin, or general domain) to give them a strong starting point.\n\n`;
  } else {
    prompt += `The player has already attempted these words: ${wordleGuesses.join(", ")}.\n`;
    prompt += `-> Tailor your clue to course-correct them. Evaluate if their attempts are close in meaning or completely off-base, and provide a direct semantic clue (e.g., real-world usage, synonym, or shared trait) that bridges the gap between their guesses and the secret word.\n\n`;
  }

  return prompt;
};
const OVERRIDE_PROMPT_PL = (
  theSecretWord: TheSecretWord,
  wordDefinition: WordMeta["wordDefinition"],
  theRiddle: WordMeta["theRiddle"],
  wordleGuesses: WordChallenge["wordleGuesses"]
) => {
  let prompt = `Ukryte słowo to "${theSecretWord}".\n\n`;

  if (Option.isSome(wordDefinition)) {
    prompt += `Oficjalna definicja słownikowa do wglądu: "${wordDefinition.value}".\n`;
    prompt += `-> Użyj jej, aby zrozumieć dokładny kontekst, ale NIE kopiuj jej dosłownie.\n\n`;
  }

  if (Option.isSome(theRiddle)) {
    prompt += `Gracz dysponuje już tą zagadką: "${theRiddle.value}".\n`;
    prompt += `-> Nie powtarzaj tych samych skojarzeń, sformułowań ani motywów.\n\n`;
  }

  if (wordleGuesses.length === 0) {
    prompt += `Gracz nie wypróbował jeszcze żadnych słów (pierwsza tura).\n`;
    prompt += `-> Podaj szeroką, fundamentalną wskazówkę (np. główną kategorię, pochodzenie lub ogólną dziedzinę), która da mu mocny punkt wyjścia.\n\n`;
  } else {
    prompt += `Gracz wypróbował już następujące słowa: ${wordleGuesses.join(", ")}.\n`;
    prompt += `-> Dostosuj swoją wskazówkę tak, aby nakierować go na właściwy tor. Oceń, czy jego próby są bliskie znaczeniowo, czy całkowicie nietrafione, i podaj bezpośrednią wskazówkę semantyczną (np. zastosowanie w życiu codziennym, synonim lub wspólną cechę), która połączy jego domysły z ukrytym słowem.\n\n`;
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
        instructions: solutionsLanguage === "En" ? SYSTEM_PROMPT_EN : SYSTEM_PROMPT_PL,
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
                  ? "The clue text in plain text only. Absolutely no Markdown, special formatting, emojis, headings, or list markers. Must be suitable for direct text-to-speech reading. Provide a complete, highly insightful thought."
                  : "Tekst wskazówki wyłącznie w postaci zwykłego tekstu. Absolutnie bez Markdownu, specjalnego formatowania, emotikonów, nagłówków ani znaczników list. Tekst musi nadawać się do bezpośredniego odczytu tekstu na mowę. Zbuduj pełną, niezwykle wnikliwą myśl."
              ),
          }),
        }),
      }),
    catch: (cause) => new AiSdkError({ message: `The attempt to generate an override using the "${model}" model was unsuccessful.`, cause }),
  }).pipe(Effect.map(({ output }) => Option.some(output.clue)));
});

const OverridePlan = ExecutionPlan.make(
  { provide: Layer.succeed(OverrideModel, google("gemini-flash-latest")), attempts: 2, schedule: Schedule.exponential("100 millis", 1.5) },
  { provide: Layer.succeed(OverrideModel, google("gemini-flash-lite-latest")), attempts: 2, schedule: Schedule.exponential("100 millis", 1.5) },
  { provide: Layer.succeed(OverrideModel, google("gemini-3.1-flash-lite")), attempts: 2, schedule: Schedule.exponential("100 millis", 1.5) }
);

export const generateOverride = (
  theSecretWord: TheSecretWord,
  wordDefinition: WordMeta["wordDefinition"],
  theRiddle: WordMeta["theRiddle"],
  wordleGuesses: WordChallenge["wordleGuesses"],
  solutionsLanguage: SolutionsLanguage
) => attemptOverrideWithModel(theSecretWord, wordDefinition, theRiddle, wordleGuesses, solutionsLanguage).pipe(Effect.withExecutionPlan(OverridePlan));
