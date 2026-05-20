// services, features, and other libraries
import { Effect, flow } from "effect";
import { FetchHttpClient, HttpClient, HttpClientRequest, HttpClientResponse } from "@effect/platform";
import { KeypadDataSchema, RiddleRequestSchema, RiddleResponseSchema, SolutionsDataSchema } from "@/domain";

// types
import type { Language } from "@/domain";

export class GameData extends Effect.Service<GameData>()("GameData", {
  dependencies: [FetchHttpClient.layer],

  effect: Effect.gen(function* () {
    const baseClient = yield* HttpClient.HttpClient.pipe(Effect.map(HttpClient.filterStatusOk));
    const dataClient = baseClient.pipe(HttpClient.mapRequest(flow(HttpClientRequest.prependUrl("/data/"), HttpClientRequest.acceptJson)));
    const apiClient = baseClient.pipe(HttpClient.mapRequest(flow(HttpClientRequest.prependUrl("/api/"), HttpClientRequest.acceptJson)));

    const fetchSolutions = (language: Language) =>
      dataClient.get(`solutions${language}.json`).pipe(Effect.flatMap(HttpClientResponse.schemaBodyJson(SolutionsDataSchema)));

    const fetchKeypad = (language: Language) =>
      dataClient.get(`keypad${language}.json`).pipe(Effect.flatMap(HttpClientResponse.schemaBodyJson(KeypadDataSchema)));

    const fetchRiddle = (theSecretWord: string, language: Language) =>
      HttpClientRequest.post("riddle").pipe(
        HttpClientRequest.schemaBodyJson(RiddleRequestSchema)({ theSecretWord, language }),
        Effect.flatMap(apiClient.execute),
        Effect.flatMap(HttpClientResponse.schemaBodyJson(RiddleResponseSchema)),
        Effect.map(({ riddle }) => riddle)
      );

    return { fetchSolutions, fetchKeypad, fetchRiddle } as const;
  }),
}) {}
