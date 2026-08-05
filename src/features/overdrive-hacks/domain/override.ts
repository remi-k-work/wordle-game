// services, features, and other libraries
import { Context, Effect, ExecutionPlan, Layer, Schedule } from "effect";
import { generateText, Output } from "ai";
import { google } from "@ai-sdk/google";
import { AiSdkError } from "@/domain";
import { z } from "zod";

// types
import type { SolutionsLanguage } from "@/features/game/domain";
import type { LanguageModel } from "ai";

// constants
const SYSTEM_PROMPT_EN = "You are a witty puzzle master for an arcade word game. Do not reveal the secret word.";
const SYSTEM_PROMPT_PL = "Jesteś błyskotliwym mistrzem łamigłówek w zręcznościowej grze słownej. Nie ujawniaj wprost ukrytego słowa.";
const OVERRIDE_PROMPT_EN = (theSecretWord: string) => `Write a short, clever riddle for the word "${theSecretWord}".`;
const OVERRIDE_PROMPT_PL = (theSecretWord: string) => `Napisz krótką, sprytną zagadkę do słowa "${theSecretWord}".`;

// Override model as a typed dependency (a service)
const OverrideModel = Context.Service<LanguageModel>("OverrideModel");

// Attempt to generate an override using the provided model
const attemptOverrideWithModel = Effect.fn("attemptOverrideWithModel")(function* (theSecretWord: string, solutionsLanguage: SolutionsLanguage) {
  const model = yield* OverrideModel;

  return yield* Effect.tryPromise({
    try: () =>
      generateText({
        model,
        instructions: solutionsLanguage === "En" ? SYSTEM_PROMPT_EN : SYSTEM_PROMPT_PL,
        prompt: solutionsLanguage === "En" ? OVERRIDE_PROMPT_EN(theSecretWord) : OVERRIDE_PROMPT_PL(theSecretWord),
        maxRetries: 0,
        output: Output.object({
          schema: z.object({
            override: z
              .string()
              .trim()
              .describe(
                solutionsLanguage === "En"
                  ? "The override text in plain text only. Absolutely no Markdown, special formatting, emojis, headings, or list markers. Must be suitable for direct text-to-speech reading."
                  : "Tekst zastępczy wyłącznie w postaci zwykłego tekstu. Absolutnie bez Markdownu, specjalnego formatowania, emotikonów, nagłówków ani znaczników list. Tekst musi nadawać się do bezpośredniego odczytu tekstu na mowę."
              ),
          }),
        }),
      }),
    catch: (cause) => new AiSdkError({ message: `The attempt to generate an override using the "${model}" model was unsuccessful.`, cause }),
  }).pipe(Effect.map(({ output }) => output.override));
});

const OverridePlan = ExecutionPlan.make(
  { provide: Layer.succeed(OverrideModel, google("gemini-flash-latest")), attempts: 2, schedule: Schedule.exponential("100 millis", 1.5) },
  { provide: Layer.succeed(OverrideModel, google("gemini-flash-lite-latest")), attempts: 2, schedule: Schedule.exponential("100 millis", 1.5) },
  { provide: Layer.succeed(OverrideModel, google("gemini-3.1-flash-lite")), attempts: 2, schedule: Schedule.exponential("100 millis", 1.5) }
);

export const generateOverride = (theSecretWord: string, solutionsLanguage: SolutionsLanguage) =>
  attemptOverrideWithModel(theSecretWord, solutionsLanguage).pipe(Effect.withExecutionPlan(OverridePlan));
