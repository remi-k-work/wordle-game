// services, features, and other libraries
import { Context, Effect, ExecutionPlan, Layer, Schedule } from "effect";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { AiSdkError } from "@/lib/errors";

// types
import type { SolutionsLanguage } from ".";
import type { LanguageModel } from "ai";

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

// Riddle model as a typed dependency (a service)
const RiddleModel = Context.Service<LanguageModel>("RiddleModel");

// Attempt to generate a riddle using the provided model
const attemptRiddleWithModel = Effect.fn("riddle.attemptRiddleWithModel")(function* (theSecretWord: string, solutionsLanguage: SolutionsLanguage) {
  const model = yield* RiddleModel;

  return yield* Effect.tryPromise({
    try: () => generateText({ model, prompt: solutionsLanguage === "En" ? RIDDLE_PROMPT_EN(theSecretWord) : RIDDLE_PROMPT_PL(theSecretWord) }),
    catch: (cause) => new AiSdkError({ message: `The attempt to generate a riddle using the "${model}" model was unsuccessful.`, cause }),
  }).pipe(Effect.map(({ text }) => text));
});

const RiddlePlan = ExecutionPlan.make(
  { provide: Layer.succeed(RiddleModel, google("gemini-flash-latest")), attempts: 2, schedule: Schedule.exponential("100 millis", 1.5) },
  { provide: Layer.succeed(RiddleModel, google("gemini-2.5-flash")), attempts: 2, schedule: Schedule.exponential("100 millis", 1.5) },
  { provide: Layer.succeed(RiddleModel, google("gemini-flash-lite-latest")), attempts: 2, schedule: Schedule.exponential("100 millis", 1.5) },
  { provide: Layer.succeed(RiddleModel, google("gemini-2.5-flash-lite")), attempts: 2, schedule: Schedule.exponential("100 millis", 1.5) }
);

export const generateRiddle = (theSecretWord: string, solutionsLanguage: SolutionsLanguage) =>
  attemptRiddleWithModel(theSecretWord, solutionsLanguage).pipe(Effect.withExecutionPlan(RiddlePlan));
