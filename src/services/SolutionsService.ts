import * as Effect from "effect/Effect";
import { Language, GameData } from "../domain/models";

export class SolutionsService extends Effect.Service<SolutionsService>()("SolutionsService", {
  effect: Effect.gen(function*() {
    return {
      fetchGameData: (language: Language) =>
        Effect.gen(function*() {
          const response = yield* Effect.tryPromise(() =>
            fetch(`/data/db-${language}.json`)
          );
          if (!response.ok) {
            return yield* Effect.fail(new Error("Unable to obtain the game data."));
          }
          const data = yield* Effect.tryPromise(() => response.json());
          return data as GameData;
        }),
    };
  }),
}) {}
