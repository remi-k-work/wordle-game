// services, features, and other libraries
import { Context, ExecutionPlan, Layer, Schedule } from "effect";
import { google } from "@ai-sdk/google";

// types
import type { LanguageModel } from "ai";

// Builds a single fallback step for the specified model
const step = (modelKey: Context.Service<LanguageModel, LanguageModel>, model: string) => ({
  provide: Layer.succeed(modelKey, google(model)),
  attempts: 2,
  schedule: Schedule.exponential("1 second", 2),
});

// Builds the shared three-model fallback ladder (3.5 → 3.1 → 2.5) for any LanguageModel key.
// Each caller keeps its own distinct model service; this only centralizes the fallback policy so
// the riddle and override generators cannot drift apart.
export const makeGeminiFallbackPlan = (modelKey: Context.Service<LanguageModel, LanguageModel>) =>
  ExecutionPlan.make(step(modelKey, "gemini-3.5-flash-lite"), step(modelKey, "gemini-3.1-flash-lite"), step(modelKey, "gemini-2.5-flash-lite"));
