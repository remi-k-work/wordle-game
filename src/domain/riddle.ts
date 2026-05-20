// services, features, and other libraries
import { Effect, ExecutionPlan, Schedule } from "effect";
import { LanguageModel } from "@effect/ai";
import { GoogleLanguageModel } from "@effect/ai-google";

// types
import type { Language } from "./models";

// constants
const RIDDLE_PROMPT_EN = (theSecretWord: string) =>
  `You are an enigmatic and witty puzzle master for an arcade word game. Your task is to write a clever, one-sentence riddle for the secret word provided below. Secret Word: ${theSecretWord}`;
const RIDDLE_PROMPT_PL = (theSecretWord: string) =>
  `Jesteś tajemniczym i błyskotliwym mistrzem zagadek w zręcznościowej grze słownej. Twoim zadaniem jest napisanie sprytnej, jednozdaniowej zagadki dla podanego poniżej tajnego słowa. Tajne Słowo: ${theSecretWord}`;

const RiddlePlan = ExecutionPlan.make(
  { provide: GoogleLanguageModel.model("gemini-flash-latest"), attempts: 2, schedule: Schedule.exponential("100 millis", 1.5) },
  { provide: GoogleLanguageModel.model("gemini-flash-lite-latest"), attempts: 2, schedule: Schedule.exponential("100 millis", 1.5) },
  { provide: GoogleLanguageModel.model("gemini-2.5-flash"), attempts: 2, schedule: Schedule.exponential("100 millis", 1.5) },
  { provide: GoogleLanguageModel.model("gemini-2.5-flash-lite"), attempts: 2, schedule: Schedule.exponential("100 millis", 1.5) }
);

export const generateRiddle = (theSecretWord: string, language: Language) =>
  LanguageModel.generateText({ prompt: language === "En" ? RIDDLE_PROMPT_EN(theSecretWord) : RIDDLE_PROMPT_PL(theSecretWord) }).pipe(
    Effect.withExecutionPlan(RiddlePlan),
    Effect.map(({ text }) => text)
  );
