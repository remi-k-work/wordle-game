// services, features, and other libraries
import { Effect, ExecutionPlan, Schedule } from "effect";
import { LanguageModel } from "@effect/ai";
import { GoogleLanguageModel } from "@effect/ai-google";

// types
import type { SolutionsLanguage } from ".";

// constants
const RIDDLE_PROMPT_EN = (theSecretWord: string) => `
You are a witty puzzle master for an arcade word game.
Write a short, clever riddle for the secret word below.

Rules:
- Return only the riddle text.
- Plain text only.
- No Markdown or special formatting.
- No headings, lists, labels, quotations, emojis, or explanations.
- Do not reveal, spell, or directly reference the secret word.
- Keep the riddle concise and suitable for a fast-paced arcade game.
- The riddle will be displayed as plain text and read aloud by a text-to-speech engine.

Secret Word: ${theSecretWord}
`;

const RIDDLE_PROMPT_PL = (theSecretWord: string) => `
Jesteś błyskotliwym mistrzem łamigłówek w zręcznościowej grze słownej.
Napisz krótką, sprytną zagadkę do poniższego sekretnego słowa.

Zasady:
- Zwróć tylko tekst zagadki.
- Tylko zwykły tekst.
- Bez znaczników Markdown ani specjalnego formatowania.
- Bez nagłówków, list, etykiet, cytatów, emotikonów i wyjaśnień.
- Nie ujawniaj, nie literuj ani nie powołuj się bezpośrednio na sekretne słowo.
- Zagadka powinna być zwięzła i odpowiednia do dynamicznej gry zręcznościowej.
- Zagadka zostanie wyświetlona jako zwykły tekst i odczytana na głos przez moduł przetwarzania tekstu na mowę.

Sekretne Słowo: ${theSecretWord}
`;

const RiddlePlan = ExecutionPlan.make(
  { provide: GoogleLanguageModel.model("gemini-flash-latest"), attempts: 2, schedule: Schedule.exponential("100 millis", 1.5) },
  { provide: GoogleLanguageModel.model("gemini-2.5-flash"), attempts: 2, schedule: Schedule.exponential("100 millis", 1.5) },
  { provide: GoogleLanguageModel.model("gemini-flash-lite-latest"), attempts: 2, schedule: Schedule.exponential("100 millis", 1.5) },
  { provide: GoogleLanguageModel.model("gemini-2.5-flash-lite"), attempts: 2, schedule: Schedule.exponential("100 millis", 1.5) }
);

export const generateRiddle = (theSecretWord: string, solutionsLanguage: SolutionsLanguage) =>
  LanguageModel.generateText({ prompt: solutionsLanguage === "En" ? RIDDLE_PROMPT_EN(theSecretWord) : RIDDLE_PROMPT_PL(theSecretWord) }).pipe(
    Effect.withExecutionPlan(RiddlePlan),
    Effect.map(({ text }) => text)
  );
