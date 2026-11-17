import { describe, expect, it } from "@effect/vitest";
import { decodeBrowseCharts } from "../helpers";

describe("decodeBrowseCharts", () => {
  it("decodes a valid language", () => {
    expect(decodeBrowseCharts({ sl: "Pl" })).toEqual({ sl: "Pl" });
    expect(decodeBrowseCharts({ sl: "En" })).toEqual({ sl: "En" });
  });

  // A hand-edited or unknown `sl` must never flow into the machine, the RPC
  // payloads or matchLanguage: it falls back to the initial language instead
  it("falls back to the initial language for an unknown or missing value", () => {
    expect(decodeBrowseCharts({ sl: "De" })).toEqual({ sl: "En" });
    expect(decodeBrowseCharts({ sl: "" })).toEqual({ sl: "En" });
    expect(decodeBrowseCharts({})).toEqual({ sl: "En" });
  });

  // Extra search params are ignored rather than rejected: the URL may carry
  // unrelated keys, and only `sl` describes the browse-charts state
  it("ignores unrelated search params", () => {
    expect(decodeBrowseCharts({ sl: "Pl", page: "2" })).toEqual({ sl: "Pl" });
  });
});
