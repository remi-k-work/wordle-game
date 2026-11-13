import "dotenv/config";

// services, features, and other libraries
import { Array, Cause, Effect, FileSystem, Option } from "effect";
import { OpenRouter } from "@/services/open-router.server";
import { OpenRouterError } from "@/domain/errors";
import { runSeed } from "./runtime";

// constants
import { VOICES_PL } from "@/domain/constants";

const EN_TEXT = "Hello! This is a text-to-speech test. The secret word hides among the letters.";
const PL_TEXT = "Zagadka: pachnący kwiat o żółtych płatkach, który kwitnie wiosną. Słowo kryje się wśród liter.";

// Generous truncation: a rate-limit or schema message is short, so the cap only
// guards against a full HTML error page
const MAX_BODY_PREVIEW = 2000;

// Render failures as strings: pretty-printing truncates nested objects, so log the enriched fields.
// Non-HTTP failures (e.g. schema issues) fall back to a full cause rendering.
const renderFailure = (error: OpenRouterError): string =>
  Option.match(Option.fromUndefinedOr(error.status), {
    onNone: () => Cause.pretty(Cause.fail(error)),
    onSome: (status) => {
      const body = Option.getOrElse(Option.fromNullishOr(error.responseBody), () => "<empty body>");
      return `HTTP ${status}: ${body.length > MAX_BODY_PREVIEW ? `${body.slice(0, MAX_BODY_PREVIEW)}…` : body}`;
    },
  });

const main = Effect.gen(function* () {
  yield* Effect.log("Testing the OpenRouter TTS API (EN/PL voice matrix)...\n");

  const { generateSpeech } = yield* OpenRouter;
  const fs = yield* FileSystem.FileSystem;

  // EN default voice + every PL voice, one case each
  // `ReadonlyArray`, not the (shadowed-by-the-import) `Array<...>` spelling:
  // this module imports Effect's Array module, so a bare `Array<T>` type here
  // resolves to the global one and reads as a mistake at a glance
  const cases: ReadonlyArray<{ name: string; input: string; voice?: string }> = [
    { name: "en-random", input: EN_TEXT },
    ...Array.map(VOICES_PL, (voice, index) => ({ name: `pl-voice-${index}`, input: PL_TEXT, voice })),
  ];

  // Sequential (the `Effect.forEach` default): the sleep after each case paces
  // the provider instead of letting every request fire at once
  yield* Effect.forEach(
    cases,
    ({ name, input, voice }) =>
      // generateSpeech normalizes an absent vs explicitly-undefined voice itself,
      // so the English `undefined` is forwarded as-is
      generateSpeech({ input, voice }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.logError(`Case '${name}' failed. ${renderFailure(error)}`),
          onSuccess: ({ audioData, generationId }) =>
            // Audio artifacts belong in the gitignored scratch directory, not in
            // the source tree next to the script that produced them
            Effect.gen(function* () {
              const fileName = `./_scratchpad/output-tts-${name}-${generationId ?? "noid"}.mp3`;
              yield* fs.writeFile(fileName, audioData);
              yield* Effect.log(`Case '${name}' saved to '${fileName}'.`);
            }),
        }),
        // Runs after every case, success or failure, as the per-iteration sleep did
        Effect.andThen(Effect.sleep("1 second"))
      ),
    { discard: true }
  );

  yield* Effect.log("TTS voice matrix complete. Listen to each file and check the spoken language and accent.");
}).pipe(Effect.provide(OpenRouter.layer));

// runSeed provides the shared Node layer and graceful teardown on CTRL+C
runSeed(main);
