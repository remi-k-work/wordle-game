// services, features, and other libraries
import { describe, expect, it } from "@effect/vitest";
import { Effect, HashSet, Option } from "effect";
import { GameContent } from "@/features/game/services/game-content";

// The test layer is the seam server-handler tests resolve `GameContent` through,
// so these tests pin its contract: supplied fixtures win, unset methods stay empty.
describe("GameContent.layerTest", () => {
  it.effect("serves the provided fixtures", () =>
    Effect.gen(function* () {
      const content = yield* GameContent;

      expect(content.solutions("En")).toStrictEqual(["APPLE"]);
      expect(content.dictionary("En")).toStrictEqual(HashSet.fromIterable(["APPLE", "BANAN"]));
      expect(content.keypad("En")).toStrictEqual(["A", "B", "C"]);
      expect(content.definition("APPLE", "En")).toStrictEqual(Option.some("a round fruit"));
    }).pipe(
      Effect.provide(
        GameContent.layerTest({
          solutions: () => ["APPLE"],
          dictionary: () => HashSet.fromIterable(["APPLE", "BANAN"]),
          keypad: () => ["A", "B", "C"],
          definition: () => Option.some("a round fruit"),
        })
      )
    )
  );

  it.effect("defaults to empty assets", () =>
    Effect.gen(function* () {
      const content = yield* GameContent;

      expect(content.solutions("Pl")).toStrictEqual([]);
      expect(HashSet.size(content.dictionary("Pl"))).toBe(0);
      expect(content.keypad("Pl")).toStrictEqual([]);
      expect(content.definition("APPLE", "Pl")).toStrictEqual(Option.none());
    }).pipe(Effect.provide(GameContent.layerTest()))
  );
});
