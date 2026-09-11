// services, features, and other libraries
import { Config, Context, Effect, flow, Layer, Schedule, Schema } from "effect";
import { FetchHttpClient, HttpClient, HttpClientRequest } from "effect/unstable/http";

class SpeechRequest extends Schema.Class<SpeechRequest>("SpeechRequest")({
  model: Schema.optionalKey(
    Schema.Trim.pipe(
      Schema.withDecodingDefaultType(Effect.succeed("fish-audio/s2.1-pro-free:free")),
      Schema.withConstructorDefault(Effect.succeed("fish-audio/s2.1-pro-free:free"))
    )
  ),
  input: Schema.Trim.pipe(Schema.check(Schema.isNonEmpty())),
  response_format: Schema.optionalKey(Schema.Literal("mp3").pipe(Schema.withDecodingDefaultType(Effect.succeed("mp3")))),
}) {}

class OpenRouterError extends Schema.TaggedError<OpenRouterError>()("OpenRouterError", {
  cause: Schema.Defect(),
}) {}

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
          client.execute
        );

        // Decode response body as ArrayBuffer using the getter on the response object
        const arrayBuffer = yield* response.arrayBuffer;

        // Convert the ArrayBuffer to a Uint8Array
        const audioData = Buffer.from(arrayBuffer);

        // Read header (headers are normalized to lowercase in Effect)
        const generationId = response.headers["x-generation-id"];

        return { audioData, generationId } as const;
      },
      Effect.mapError((cause) => new OpenRouterError({ cause }))
    );

    return { generateSpeech } as const;
  }),
}) {
  static readonly layer = Layer.effect(this, this.make).pipe(Layer.provide(FetchHttpClient.layer));
}
