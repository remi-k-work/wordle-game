import { describe, expect, it } from "@effect/vitest";
import { Option } from "effect";
import { pickStrongerColor } from "../helpers";

describe("helpers", () => {
  describe("pickStrongerColor", () => {
    it("prefers green over yellow", () => {
      expect(pickStrongerColor(Option.some("yellow"), "green")).toBe("green");
      expect(pickStrongerColor(Option.some("green"), "yellow")).toBe("green");
    });

    it("prefers yellow over grey", () => {
      expect(pickStrongerColor(Option.some("grey"), "yellow")).toBe("yellow");
      expect(pickStrongerColor(Option.some("yellow"), "grey")).toBe("yellow");
    });

    it("prefers red over everything", () => {
      expect(pickStrongerColor(Option.some("green"), "red")).toBe("red");
    });

    it("handles initial absence (Option.none)", () => {
      expect(pickStrongerColor(Option.none(), "grey")).toBe("grey");
      expect(pickStrongerColor(Option.none(), "green")).toBe("green");
    });
  });
});
