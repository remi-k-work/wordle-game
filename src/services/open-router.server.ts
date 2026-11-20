// services, features, and other libraries
import { Config, Context, Effect, flow, Layer, Option, Random, Schedule, Schema } from "effect";
import { FetchHttpClient, HttpClient, HttpClientRequest } from "effect/http";
import { SpeechRequest } from "@/domain/models";
import { OpenRouterError } from "@/domain/errors";
import { degradeToNone } from "@/domain/helpers";

// types
import type { SolutionsLanguage } from "@/features/game/domain/models";

// constants
import { VOICES_PL } from "@/domain/constants";

// Compiled once at module scope instead of on every speech request
// (js-cache-function-results)
const decodeSpeechRequest = Schema.decodeEffect(SpeechRequest);
const isOpenRouterError = Schema.is(OpenRouterError);

export class OpenRouter extends Context.Service<
  OpenRouter,
  {
    readonly generateSpeech: (request: { readonly input: string; readonly voice?: string }) => Effect.Effect<
      {
        readonly audioData: Uint8Array;
        readonly generationId: string;
      },
      OpenRouterError
    >;
  }
>()("OpenRouter") {
  static readonly layer = Layer.effect(
    OpenRouter,
    Effect.gen(function* () {
      const apiKey = yield* Config.Redacted("OPENROUTER_API_KEY");

      // Configure common client settings, base URL, auth, and retry policies
      const client = (yield* HttpClient.HttpClient).pipe(
        HttpClient.mapRequest(
          flow(HttpClientRequest.prependUrl("https://openrouter.ai/api/v1"), HttpClientRequest.bearerToken(apiKey), HttpClientRequest.acceptJson)
        ),
        HttpClient.filterStatusOk,
        HttpClient.retryTransient({ schedule: Schedule.exponential("100 millis"), times: 3 })
      );

      // Text-to-speech effect execution
      const generateSpeech = Effect.fn("generateSpeech")(
        function* ({ input, voice }: { readonly input: string; readonly voice?: string }) {
          // Decode and validate the text and optional voice at the service boundary
          // (`voice` accepts an explicit `undefined`, so it is forwarded as-is)
          const speechRequest = yield* decodeSpeechRequest({ input, voice });

          // Execute request
          const request = yield* HttpClientRequest.post("/audio/speech").pipe(HttpClientRequest.bodyJson(speechRequest));
          const response = yield* client.execute(request).pipe(
            // Surface upstream status + body (e.g. rate-limit details) instead of burying them in `cause`
            Effect.catchTag("HttpClientError", (clientError) => {
              const errorResponse = clientError.response;
              if (errorResponse === undefined) return new OpenRouterError({ cause: clientError });
              // `Schema.TaggedError` instances are themselves failing Effects, so
              // `Effect.flatMap` into one yields the error — no nested generator needed
              return errorResponse.text.pipe(
                Effect.orElseSucceed(() => "<unreadable body>"),
                Effect.flatMap((responseBody) => new OpenRouterError({ cause: clientError, status: errorResponse.status, responseBody }))
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
        Effect.mapError((error) => (isOpenRouterError(error) ? error : new OpenRouterError({ cause: error })))
      );

      return OpenRouter.of({ generateSpeech });
    })
  ).pipe(Layer.provide(FetchHttpClient.layer));
}

// Shared TTS-audio RPC handler for every speech-capable group: generates speech
// for a text input, picking a random "Top Recommended" Polish voice for the Pl
// mode and OpenRouter's default voice for En. Audio is a non-critical
// enrichment, so failures are logged and degrade to Option.none() instead of
// failing the request — the same recovery `withAiFallback` uses, factored into
// `degradeToNone` so the two cannot drift apart
export const fetchSpeechAudio = Effect.fnUntraced(function* ({ input, solutionsLanguage }: { input: string; solutionsLanguage: SolutionsLanguage }) {
  const { generateSpeech } = yield* OpenRouter;

  // OpenRouter's default voice is used for English; pick a random recommended Polish voice otherwise
  const voice = solutionsLanguage === "En" ? undefined : yield* Random.choice(VOICES_PL);
  const { audioData } = yield* generateSpeech({ input, voice });

  return Option.some(audioData);
}, degradeToNone);
