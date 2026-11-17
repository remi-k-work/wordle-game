// services, features, and other libraries
import { Cause, Duration, Effect, ExecutionPlan, Option, Schedule, Schema } from "effect";
import { LanguageModel, Model, Prompt } from "effect/ai";
import { OpenAiLanguageModel } from "@effect/ai-openai-compat";
import { riddleGenerationOptions } from "@/features/game/domain/riddle2";

// types
import type { SolutionsLanguage, WordMeta } from "@/features/game/domain/models";

export type GeneratedRiddle = {
  readonly modelName: string;
  readonly riddle: string;
};

// The bilingual proof matrix every model-level proof runs: one English and one
// Polish case, so a regression in either language's prompt is visible. Shared so
// the proofs cannot silently test different words than each other
export const PROOF_TEST_CASES = [
  { theSecretWord: "MIRROR", solutionsLanguage: "En" },
  { theSecretWord: "LUSTRO", solutionsLanguage: "Pl" },
] as const satisfies ReadonlyArray<{
  readonly theSecretWord: string;
  readonly solutionsLanguage: SolutionsLanguage;
}>;

// One proof step: the model to try, a single attempt, and a bounded retry.
// Shared by the proof scripts so they exercise every provider with one retry
// policy instead of each hand-rolling (and drifting from) its own
export const planFor = (id: string, config: typeof OpenAiLanguageModel.Config.Service) =>
  ExecutionPlan.make({
    provide: OpenAiLanguageModel.model(id, config),
    attempts: 1,
    schedule: Schedule.exponential("1 second", 2),
  });

// Mirrors the production single-field generation flow (same prompt and schema
// construction, driven by the shared `riddleGenerationOptions`) while also
// exposing the model that actually handled the request. `fieldName` is "riddle"
// by construction, so the schema is spelled out rather than re-derived
export const generateRiddle = Effect.fn("generateRiddle")(function* (
  theSecretWord: string,
  solutionsLanguage: SolutionsLanguage,
  wordDefinition: WordMeta["wordDefinition"] = Option.none()
) {
  const languageModel = yield* LanguageModel.LanguageModel;
  const modelName = yield* Model.ModelName;

  const options = riddleGenerationOptions(theSecretWord, solutionsLanguage, wordDefinition);
  const schema = Schema.Struct({ riddle: Schema.Trim.pipe(Schema.annotate({ description: options.description })) });
  const prompt = Prompt.fromMessages([
    Prompt.systemMessage({ content: options.instructions }),
    Prompt.userMessage({ content: [Prompt.textPart({ text: options.userPrompt })] }),
  ]);

  const { value } = yield* languageModel.generateObject({ prompt, schema });

  return { modelName, riddle: value.riddle } as const;
});

// Runs one proof case, reporting how long it took and which model answered.
// Shared by both riddle proofs so the verbatim-leak check applies to every
// model they exercise, not just the A/B matrix
export const runCase = <A extends GeneratedRiddle, E, R>(label: string, theSecretWord: string, effect: Effect.Effect<A, E, R>) =>
  effect.pipe(
    Effect.timed,
    Effect.matchEffect({
      onFailure: (error) => Effect.logError(`Case '${label}' failed. ${Cause.pretty(Cause.fail(error))}`),

      onSuccess: ([duration, result]) => {
        // Exact-match check only: an inflected or embedded occurrence of the
        // secret word still needs a human review, but a verbatim leak is a bug
        const leaked = result.riddle.toUpperCase().includes(theSecretWord.toUpperCase());
        const warning = leaked ? " [EXACT SECRET WORD FOUND]" : "";

        return Effect.log(`Case '${label}' succeeded with '${result.modelName}' in ${Duration.toMillis(duration)}ms.${warning}\n${result.riddle}\n`);
      },
    })
  );
