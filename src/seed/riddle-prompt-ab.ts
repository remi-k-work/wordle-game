import "dotenv/config";

// services, features, and other libraries
import { Effect, Option, Record, Schema } from "effect";
import { AiClientsWithHttp } from "@/domain/fallback-plan2";
import { planFor, runCase, generateRiddle } from "./riddle-proof";
import { runSeed } from "./runtime";

// assets
import definitionsPlJson from "@/assets/data/definitions-pl.json";

// types
import type { TheSecretWord } from "@/features/game/domain/models";

// Both A/B arms are only comparable if the model is held constant, so each label
// is paired with the single plan step that runs it
const LLAMA_LABEL = "Llama 3.3 70B (Cloudflare)";
const LLAMA_PLAN = planFor("@cf/meta/llama-3.3-70b-instruct-fp8-fast", { strictJsonSchema: true });

const GEMMA_LABEL = "Gemma 4 26B (Cloudflare)";
const GEMMA_PLAN = planFor("@cf/google/gemma-4-26b-a4b-it", { strictJsonSchema: true, chat_template_kwargs: { enable_thinking: false } });

class MissingDefinitionError extends Schema.TaggedError<MissingDefinitionError, { readonly brand: unique symbol }>()("MissingDefinitionError", {
  theSecretWord: Schema.String,
}) {}

// Exotic Polish solutions are the cases where the model is most likely to
// guess the wrong sense or hallucinate a meaning without the dictionary context
const TEST_WORDS = ["ABAJA", "ABCUG", "ABSTA", "ADAKS"] as const satisfies ReadonlyArray<TheSecretWord>;

// The build-time definition asset, mirrored from the RPC handler's schema
const Definitions = Schema.Record(Schema.String, Schema.String);

// `Record.get` rather than an index: `Record.get` returns an `Option`, and the
// decoded record has no index signature guaranteeing a hit (tsconfig does not
// enable `noUncheckedIndexedAccess`) — the same reason the RPC handler's
// `getWordDefinition` reads its decoded record this way
// Combinator-based (no Effect.fn/gen wrapper) per Effect conventions for reusable functions
const getDefinition = (definitions: Readonly<Record<string, string>>, theSecretWord: TheSecretWord) =>
  Record.get(definitions, theSecretWord).pipe(Effect.fromOption(() => new MissingDefinitionError({ theSecretWord })));

const main = Effect.gen(function* () {
  // Decoded inside the program rather than at module scope, so a drifting asset
  // fails this script with a reported error instead of throwing at import time.
  // `decodeEffect` (not `decodeUnknownEffect`) keeps the asset's compile-time type
  const definitions = yield* Schema.decodeEffect(Definitions)(definitionsPlJson);

  yield* Effect.log("A/B: Polish riddles — baseline prompt vs definition-aware prompt\n");

  // Sequential (the `Effect.forEach` default), and interruptible as one Effect
  yield* Effect.forEach(
    TEST_WORDS,
    (theSecretWord) =>
      getDefinition(definitions, theSecretWord).pipe(
        Effect.tap((definition) => Effect.log(`=== ${theSecretWord} ===\nDefinition: ${definition}\n`)),
        Effect.flatMap((definition) =>
          Effect.all(
            [
              runCase(`${LLAMA_LABEL} / baseline`, theSecretWord, generateRiddle(theSecretWord, "Pl").pipe(Effect.withExecutionPlan(LLAMA_PLAN))),
              runCase(
                `${LLAMA_LABEL} / + definition`,
                theSecretWord,
                generateRiddle(theSecretWord, "Pl", Option.some(definition)).pipe(Effect.withExecutionPlan(LLAMA_PLAN))
              ),
              runCase(`${GEMMA_LABEL} / baseline`, theSecretWord, generateRiddle(theSecretWord, "Pl").pipe(Effect.withExecutionPlan(GEMMA_PLAN))),
              runCase(
                `${GEMMA_LABEL} / + definition`,
                theSecretWord,
                generateRiddle(theSecretWord, "Pl", Option.some(definition)).pipe(Effect.withExecutionPlan(GEMMA_PLAN))
              ),
            ],
            { discard: true }
          )
        )
      ),
    { discard: true }
  );
}).pipe(Effect.provide(AiClientsWithHttp));

// runSeed provides the shared Node layer and graceful teardown on CTRL+C
runSeed(main);
