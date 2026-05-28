// services, features, and other libraries
import { Effect, flow } from "effect";
import { FetchHttpClient, HttpClient, HttpClientRequest, HttpClientResponse } from "@effect/platform";
import { KeypadDataSchema, RiddleRequestSchema, RiddleResponseSchema, SolutionsDataSchema } from "@/features/game/domain";

// types
import type { SolutionsLanguage } from "@/features/game/domain";

export class GameData extends Effect.Service<GameData>()("GameData", {
  dependencies: [FetchHttpClient.layer],

  effect: Effect.gen(function* () {
    const baseClient = yield* HttpClient.HttpClient.pipe(Effect.map(HttpClient.filterStatusOk));
    const dataClient = baseClient.pipe(HttpClient.mapRequest(flow(HttpClientRequest.prependUrl("/data/"), HttpClientRequest.acceptJson)));
    const apiClient = baseClient.pipe(HttpClient.mapRequest(flow(HttpClientRequest.prependUrl("/api/"), HttpClientRequest.acceptJson)));

    const fetchSolutions = (solutionsLanguage: SolutionsLanguage) =>
      dataClient.get(`solutions${solutionsLanguage}.json`).pipe(Effect.flatMap(HttpClientResponse.schemaBodyJson(SolutionsDataSchema)));

    const fetchKeypad = (solutionsLanguage: SolutionsLanguage) =>
      dataClient.get(`keypad${solutionsLanguage}.json`).pipe(Effect.flatMap(HttpClientResponse.schemaBodyJson(KeypadDataSchema)));

    const fetchRiddle = (theSecretWord: string, solutionsLanguage: SolutionsLanguage) =>
      HttpClientRequest.post("riddle").pipe(
        HttpClientRequest.schemaBodyJson(RiddleRequestSchema)({ theSecretWord, solutionsLanguage }),
        Effect.flatMap(apiClient.execute),
        Effect.flatMap(HttpClientResponse.schemaBodyJson(RiddleResponseSchema)),
        Effect.map(({ riddle }) => riddle)
      );

    return { fetchSolutions, fetchKeypad, fetchRiddle } as const;
  }),
}) {}
