import { describe, expect, it } from "@effect/vitest";
import { pickStrongerColor } from "../helpers";

describe("helpers", () => {
  describe("pickStrongerColor", () => {
    it("prefers green over yellow", () => {
      expect(pickStrongerColor("yellow", "green")).toBe("green");
      expect(pickStrongerColor("green", "yellow")).toBe("green");
    });

    it("prefers yellow over grey", () => {
      expect(pickStrongerColor("grey", "yellow")).toBe("yellow");
      expect(pickStrongerColor("yellow", "grey")).toBe("yellow");
    });

    it("prefers red over everything", () => {
      expect(pickStrongerColor("green", "red")).toBe("red");
    });

    it("handles initial undefined", () => {
      expect(pickStrongerColor(undefined, "grey")).toBe("grey");
      expect(pickStrongerColor(undefined, "green")).toBe("green");
    });
  });
});
