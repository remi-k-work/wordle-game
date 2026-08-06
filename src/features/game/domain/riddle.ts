// services, features, and other libraries
import { Context, Effect, ExecutionPlan, Layer, Schedule } from "effect";
import { generateText, Output } from "ai";
import { google } from "@ai-sdk/google";
import { AiSdkError } from "@/domain";
import { z } from "zod";

// types
import type { SolutionsLanguage, TheSecretWord } from ".";
import type { LanguageModel } from "ai";

// constants
const SYSTEM_PROMPT_EN = "You are a witty puzzle master for an arcade word game. Do not reveal the secret word.";
const SYSTEM_PROMPT_PL = "Jesteś błyskotliwym mistrzem łamigłówek w zręcznościowej grze słownej. Nie ujawniaj wprost ukrytego słowa.";
const RIDDLE_PROMPT_EN = (theSecretWord: TheSecretWord) => `Write a short, clever riddle for the word "${theSecretWord}".`;
const RIDDLE_PROMPT_PL = (theSecretWord: TheSecretWord) => `Napisz krótką, sprytną zagadkę do słowa "${theSecretWord}".`;

// Riddle model as a typed dependency (a service)
const RiddleModel = Context.Service<LanguageModel>("RiddleModel");

// Attempt to generate a riddle using the provided model
const attemptRiddleWithModel = Effect.fn("attemptRiddleWithModel")(function* (theSecretWord: TheSecretWord, solutionsLanguage: SolutionsLanguage) {
  const model = yield* RiddleModel;

  return yield* Effect.tryPromise({
    try: () =>
      generateText({
        model,
        instructions: solutionsLanguage === "En" ? SYSTEM_PROMPT_EN : SYSTEM_PROMPT_PL,
        prompt: solutionsLanguage === "En" ? RIDDLE_PROMPT_EN(theSecretWord) : RIDDLE_PROMPT_PL(theSecretWord),
        maxRetries: 0,
        output: Output.object({
          schema: z.object({
            riddle: z
              .string()
              .trim()
              .describe(
                solutionsLanguage === "En"
                  ? "The riddle text in plain text only. Absolutely no Markdown, special formatting, emojis, headings, or list markers. Must be suitable for direct text-to-speech reading."
                  : "Tekst zagadki wyłącznie w postaci zwykłego tekstu. Absolutnie bez Markdownu, specjalnego formatowania, emotikonów, nagłówków ani znaczników list. Tekst musi nadawać się do bezpośredniego odczytu tekstu na mowę."
              ),
          }),
        }),
      }),
    catch: (cause) => new AiSdkError({ message: `The attempt to generate a riddle using the "${model}" model was unsuccessful.`, cause }),
  }).pipe(Effect.map(({ output }) => output.riddle));
});

const RiddlePlan = ExecutionPlan.make(
  { provide: Layer.succeed(RiddleModel, google("gemini-flash-latest")), attempts: 2, schedule: Schedule.exponential("100 millis", 1.5) },
  { provide: Layer.succeed(RiddleModel, google("gemini-flash-lite-latest")), attempts: 2, schedule: Schedule.exponential("100 millis", 1.5) },
  { provide: Layer.succeed(RiddleModel, google("gemini-3.1-flash-lite")), attempts: 2, schedule: Schedule.exponential("100 millis", 1.5) }
);

export const generateRiddle = (theSecretWord: TheSecretWord, solutionsLanguage: SolutionsLanguage) =>
  attemptRiddleWithModel(theSecretWord, solutionsLanguage).pipe(Effect.withExecutionPlan(RiddlePlan));
