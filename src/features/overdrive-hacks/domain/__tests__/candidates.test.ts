import { describe, expect, it } from "@effect/vitest";
import { computeEmpCandidates } from "../emp";
import { computeSonarCandidates } from "../sonar";

describe("overdrive hack candidates", () => {
  it("never offers the EMP a secret, guessed, or already-nuked letter", () => {
    const candidates = computeEmpCandidates("APPLE", ["BZZZZ"], ["A", "B", "C", "D", "E", "L", "P"], ["C"]);

    expect(candidates).toEqual(["D"]);
  });

  it("only offers Sonar vowels the player has not already found or revealed", () => {
    const candidates = computeSonarCandidates("AUDIO", ["ALERT"], ["A", "E", "I", "O", "U"], ["U"]);

    // A was genuinely found in ALERT; U was already revealed by Sonar.
    expect(candidates).toEqual(["I", "O"]);
  });
});
