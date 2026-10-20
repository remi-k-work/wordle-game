import "dotenv/config";

// services, features, and other libraries
import { Array, Cause, Effect, FileSystem, Layer, Logger } from "effect";
import { NodeRuntime, NodeServices } from "@effect/platform-node";
import { OpenRouter } from "@/services/open-router.server";
import { OpenRouterError } from "@/domain/errors";

// constants
import { VOICES_PL } from "@/domain/constants";

const MainLayer = Layer.mergeAll(Logger.layer([Logger.consolePretty()]), NodeServices.layer, OpenRouter.layer);

const EN_TEXT = "Hello! This is a text-to-speech test. The secret word hides among the letters.";
const PL_TEXT = "Zagadka: pachnący kwiat o żółtych płatkach, który kwitnie wiosną. Słowo kryje się wśród liter.";

// Render failures as strings: pretty-printing truncates nested objects, so log the enriched fields.
// Non-HTTP failures (e.g. schema issues) fall back to a full cause rendering.
const renderFailure = (error: OpenRouterError): string => {
  if (error.status === undefined) return Cause.pretty(Cause.fail(error));
  const body = error.responseBody ?? "<empty body>";
  return `HTTP ${error.status}: ${body.length > 2000 ? `${body.slice(0, 2000)}…` : body}`;
};

const main = Effect.gen(function* () {
  yield* Effect.log("Testing the OpenRouter TTS API (EN/PL voice matrix)...\n");

  const { generateSpeech } = yield* OpenRouter;
  const fs = yield* FileSystem.FileSystem;

  // EN default voice + every PL voice, one case each
  const cases: Array<{ name: string; input: string; voice?: string }> = [
    { name: "en-random", input: EN_TEXT },
    ...Array.map(VOICES_PL, (voice, index) => ({ name: `pl-voice-${index}`, input: PL_TEXT, voice })),
  ];

  for (const { name, input, voice } of cases) {
    yield* generateSpeech(voice === undefined ? { input } : { input, voice }).pipe(
      Effect.matchEffect({
        onFailure: (error) => Effect.logError(`Case '${name}' failed. ${renderFailure(error)}`),
        onSuccess: ({ audioData, generationId }) =>
          Effect.gen(function* () {
            const fileName = `./src/seed/output-tts-${name}-${generationId ?? "noid"}.mp3`;
            yield* fs.writeFile(fileName, audioData);
            yield* Effect.log(`Case '${name}' saved to '${fileName}'.`);
          }),
      })
    );
    yield* Effect.sleep("1 second");
  }

  yield* Effect.log("TTS voice matrix complete. Listen to each file and check the spoken language and accent.");
}).pipe(Effect.provide(MainLayer));

// Use NodeRuntime.runMain for graceful teardown on CTRL+C
NodeRuntime.runMain(main);
