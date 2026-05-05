// services, features, and other libraries
import { Effect, flow } from "effect";
import { FetchHttpClient, HttpClient, HttpClientRequest, HttpClientResponse } from "@effect/platform";
import { KeypadDataSchema, SolutionsDataSchema } from "@/domain/models";

// types
import type { Language } from "@/domain/models";

export class GameData extends Effect.Service<GameData>()("GameData", {
  dependencies: [FetchHttpClient.layer],

  effect: Effect.gen(function* () {
    const baseClient = yield* HttpClient.HttpClient.pipe(Effect.map(HttpClient.filterStatusOk));
    const client = baseClient.pipe(HttpClient.mapRequest(flow(HttpClientRequest.prependUrl("/data/"), HttpClientRequest.acceptJson)));

    const fetchSolutions = (language: Language) =>
      client.get(`solutions${language}.json`).pipe(Effect.flatMap(HttpClientResponse.schemaBodyJson(SolutionsDataSchema)));
    const fetchKeypad = (language: Language) => client.get(`keypad${language}.json`).pipe(Effect.flatMap(HttpClientResponse.schemaBodyJson(KeypadDataSchema)));

    return { fetchSolutions, fetchKeypad } as const;
  }),
}) {}
