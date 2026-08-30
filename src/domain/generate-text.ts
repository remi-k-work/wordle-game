// services, features, and other libraries
import { Effect } from "effect";
import { generateText, Output } from "ai";
import { z } from "zod";

// domain
import { AiSdkError } from "./errors";

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
export const generateSingleField = (model: LanguageModel, options: GenerateSingleFieldOptions): Effect.Effect<string, AiSdkError, never> =>
  Effect.tryPromise({
    try: () =>
      generateText({
        model,
        temperature: options.temperature,
        instructions: options.instructions,
        prompt: options.prompt,
        maxRetries: 0,
        output: Output.object({
          schema: z.object({
            [options.fieldName]: z.string().trim().describe(options.description),
          }),
        }),
      }),
    catch: (cause) =>
      new AiSdkError({
        message: `The attempt to generate output using the "${model}" model was unsuccessful.`,
        cause,
      }),
  }).pipe(Effect.map(({ output }) => output[options.fieldName as keyof typeof output] as string));
