// services, features, and other libraries
import { Effect } from "effect";
import { generateText, Output } from "ai";
import { z } from "zod";
import { AiSdkError } from ".";

// types
import type { LanguageModel } from "ai";

interface GenerateSingleFieldOptions {
  readonly temperature: number;
  readonly instructions: string;
  readonly prompt: string;
  readonly fieldName: string;
  readonly description: string;
}

// Runs a single `generateText` call producing exactly one string field (trimmed,
// with a TTS-friendly description), mapping any failure into a typed AiSdkError.
// Shared by the riddle and override generators so their AI-call plumbing cannot
// drift apart; the model, prompts, and instructions stay language/content-specific
// at each call site. The caller supplies an already-resolved LanguageModel.
export const generateSingleField = (model: LanguageModel, { temperature, instructions, prompt, fieldName, description }: GenerateSingleFieldOptions) =>
  Effect.tryPromise({
    try: () => {
      const schema = z.object({ [fieldName]: z.string().trim().describe(description) });
      return generateText({ model, temperature, instructions, prompt, maxRetries: 0, output: Output.object({ schema }) });
    },
    catch: (cause) =>
      new AiSdkError({
        message: `The attempt to generate output using the "${typeof model === "string" ? model : model.modelId}" model was unsuccessful.`,
        cause,
      }),
  }).pipe(Effect.map(({ output }) => output[fieldName]));
