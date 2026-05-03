// services, features, and other libraries
import { Effect, flow } from "effect";
import { FetchHttpClient, HttpClient, HttpClientRequest, HttpClientResponse } from "@effect/platform";
import { GameDataSchema } from "@/domain/models";

// types
import type { Language } from "@/domain/models";

export class SolutionsService extends Effect.Service<SolutionsService>()("SolutionsService", {
  dependencies: [FetchHttpClient.layer],

  effect: Effect.gen(function* () {
    const baseClient = yield* HttpClient.HttpClient.pipe(Effect.map(HttpClient.filterStatusOk));
    const client = baseClient.pipe(HttpClient.mapRequest(flow(HttpClientRequest.prependUrl("/data/"), HttpClientRequest.acceptJson)));

    const fetchGameData = (language: Language) => client.get(`db-${language}.json`).pipe(Effect.flatMap(HttpClientResponse.schemaBodyJson(GameDataSchema)));

    return { fetchGameData } as const;
  }),
}) {}
