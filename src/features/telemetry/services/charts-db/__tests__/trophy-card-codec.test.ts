// Regression guard: every schema on the getBestRunTrophyCard / addArcadeRunSummary
// wire path must compile under the SchemaBinary RPC codec. SchemaBinary rejects
// unions whose members are not uniquely identifiable (e.g. two plain strings),
// which fails at first encode — surfacing as a silent onFailure skeleton in the UI.
import { DateTime, Option, Schema } from "effect";
import * as SchemaBinary from "effect/unstable/encoding/SchemaBinary";
import { describe, expect, it } from "vitest";
import { AddArcadeRunSummary } from "@/features/telemetry/domain";
import { BestRunTrophyCardData } from "@/features/telemetry/services/charts-db/models";

const trophyValue = BestRunTrophyCardData.make({
  deathReason: "Guesses",
  failedOnWord: "CRANE",
  finalScore: 120,
  finalStreak: 3,
  durationSeconds: 45,
  createdAt: DateTime.fromDateUnsafe(new Date("2025-09-01T12:00:00Z")),
});

const sentinelValue = BestRunTrophyCardData.make({
  ...trophyValue,
  deathReason: "Forfeit",
  failedOnWord: "N/A",
});

describe("trophy card RPC wire schemas", () => {
  it.each([trophyValue, sentinelValue])("SchemaBinary round-trips BestRunTrophyCardData (%j)", (value) => {
    const codec = SchemaBinary.toCodec(BestRunTrophyCardData);
    expect(Schema.decodeSync(codec)(Schema.encodeSync(codec)(value))).toEqual(value);
  });

  it("SchemaBinary round-trips the Option wrapper used as RPC success", () => {
    const schema = Schema.Option(BestRunTrophyCardData);
    const codec = SchemaBinary.toCodec(schema);
    const value = Option.some(trophyValue);
    expect(Schema.decodeSync(codec)(Schema.encodeSync(codec)(value))).toEqual(value);
  });

  it("SchemaBinary compiles the addArcadeRunSummary payload schema", () => {
    const run = AddArcadeRunSummary.make({
      runId: "123e4567-e89b-12d3-a456-426614174000",
      sessionId: "123e4567-e89b-12d3-a456-426614174001",
      solutionsLanguage: "En",
      deathReason: "Guesses",
      failedOnWord: "N/A",
      finalScore: 0,
      finalStreak: 0,
      durationSeconds: 10,
    });
    const codec = SchemaBinary.toCodec(AddArcadeRunSummary);
    expect(Schema.decodeSync(codec)(Schema.encodeSync(codec)(run))).toEqual(run);
  });
});
