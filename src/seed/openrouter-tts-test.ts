import "dotenv/config";

// services, features, and other libraries
import { Cause, Effect, FileSystem, Layer, Logger } from "effect";
import { NodeRuntime, NodeServices } from "@effect/platform-node";
import { OpenRouter } from "@/services/open-router";
import { OpenRouterError } from "@/domain";

// constants
import { VOICES_PL } from "@/domain";

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

  const cases: Array<{ name: string; input: string; voice?: string }> = [
    { name: "en-random", input: EN_TEXT },
    { name: "pl-voice-0", input: PL_TEXT, voice: VOICES_PL[0] },
    { name: "pl-voice-1", input: PL_TEXT, voice: VOICES_PL[1] },
    { name: "pl-voice-2", input: PL_TEXT, voice: VOICES_PL[2] },
    { name: "pl-voice-3", input: PL_TEXT, voice: VOICES_PL[3] },
    { name: "pl-voice-4", input: PL_TEXT, voice: VOICES_PL[4] },
    { name: "pl-voice-5", input: PL_TEXT, voice: VOICES_PL[5] },
    { name: "pl-voice-6", input: PL_TEXT, voice: VOICES_PL[6] },
    { name: "pl-voice-7", input: PL_TEXT, voice: VOICES_PL[7] },
    { name: "pl-voice-8", input: PL_TEXT, voice: VOICES_PL[8] },
    { name: "pl-voice-9", input: PL_TEXT, voice: VOICES_PL[9] },
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
