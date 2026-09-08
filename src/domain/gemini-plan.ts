// services, features, and other libraries
import { Context, ExecutionPlan, Layer, Schedule } from "effect";
import { google } from "@ai-sdk/google";

// types
import type { LanguageModel } from "ai";
import type { GoogleModelId } from "@ai-sdk/google/internal";

// Builds a single fallback step for the specified model
const step = (modelKey: Context.Service<LanguageModel, LanguageModel>, model: GoogleModelId) => ({
  provide: Layer.succeed(modelKey, google(model)),
  attempts: 2,
  schedule: Schedule.exponential("1 second", 2),
});

// Builds the shared fallback ladder for any LanguageModel service
export const makeGeminiFallbackPlan = (modelKey: Context.Service<LanguageModel, LanguageModel>) =>
  ExecutionPlan.make(step(modelKey, "gemini-3.5-flash-lite"), step(modelKey, "gemini-3.1-flash-lite"), step(modelKey, "gemini-2.5-flash-lite"));
