// services, features, and other libraries
import { Array, Config, Context, Effect, Layer, Option, Random, Schedule, Schema, flow } from "effect";
import { FetchHttpClient, HttpClient, HttpClientRequest } from "effect/http";
import { SpeechRequest } from "@/domain/models";
import { OpenRouterError } from "@/domain/errors";
import { matchLanguage } from "@/features/game/domain/helpers";

// types
import type { SolutionsLanguage } from "@/features/game/domain/models";

// constants
import { VOICES_PL } from "@/domain/constants";

export class OpenRouter extends Context.Service<OpenRouter>()("OpenRouter", {
  make: Effect.gen(function* () {
    const apiKey = yield* Config.Redacted("OPENROUTER_API_KEY");

    // Configure common client settings, base URL, auth, and retry policies
    const client = (yield* HttpClient.HttpClient).pipe(
      HttpClient.mapRequest(
        flow(HttpClientRequest.prependUrl("https://openrouter.ai/api/v1"), HttpClientRequest.bearerToken(apiKey), HttpClientRequest.acceptJson)
      ),
      HttpClient.filterStatusOk,
      HttpClient.retryTransient({ schedule: Schedule.exponential(100), times: 3 })
    );

    // Text-to-speech effect execution
    const generateSpeech = Effect.fn("generateSpeech")(
      function* (speechRequest: SpeechRequest) {
        // Execute request
        const response = yield* HttpClientRequest.post("/audio/speech").pipe(
          HttpClientRequest.bodyJsonUnsafe(yield* Schema.decodeEffect(SpeechRequest)(speechRequest)),
          client.execute,
          // Surface upstream status + body (e.g. rate-limit details) instead of burying them in `cause`
          Effect.catchTag("HttpClientError", (clientError) => {
            const response = clientError.response;
            if (response === undefined) return Effect.fail(new OpenRouterError({ cause: clientError }));
            return response.text.pipe(
              Effect.orElseSucceed(() => "<unreadable body>"),
              Effect.flatMap((responseBody) => Effect.fail(new OpenRouterError({ cause: clientError, status: response.status, responseBody })))
            );
          })
        );

        // Decode response body as ArrayBuffer using the getter on the response object
        const arrayBuffer = yield* response.arrayBuffer;

        // View the ArrayBuffer as a plain Uint8Array (the wire format of WordMeta's audio fields)
        const audioData = new Uint8Array(arrayBuffer);

        // Read header (headers are normalized to lowercase in Effect)
        const generationId = response.headers["x-generation-id"];

        return { audioData, generationId } as const;
      },
      Effect.mapError((cause) => (Schema.is(OpenRouterError)(cause) ? cause : new OpenRouterError({ cause })))
    );

    return { generateSpeech } as const;
  }),
}) {
  static readonly layer = Layer.effect(this, this.make).pipe(Layer.provide(FetchHttpClient.layer));
}

// Shared TTS-audio RPC handler for every speech-capable group: generates speech
// for a text input, picking a random "Top Recommended" Polish voice for the Pl
// mode and OpenRouter's default voice for En. Audio is a non-critical
// enrichment, so failures are logged and degrade to Option.none() instead of
// failing the request
export const fetchSpeechAudio = Effect.fnUntraced(
  function* ({ input, solutionsLanguage }: { input: string; solutionsLanguage: SolutionsLanguage }) {
    const { generateSpeech } = yield* OpenRouter;

    // nextIntBetween's upper bound is inclusive, so the last valid index is length - 1
    const randomIndex = yield* Random.nextIntBetween(0, VOICES_PL.length - 1);
    const voice = matchLanguage(solutionsLanguage, Option.none(), Array.get(VOICES_PL, randomIndex)).valueOrUndefined;

    const { audioData } = yield* generateSpeech(voice === undefined ? { input } : { input, voice });

    return Option.some(audioData);
  },
  Effect.tapError(Effect.logError),
  Effect.orElseSucceed(() => Option.none())
);
