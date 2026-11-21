// Regression guard: every schema on the getBestRunTrophyCard / addArcadeRunSummary
// wire path must compile under the SchemaBinary RPC codec. SchemaBinary rejects
// unions whose members are not uniquely identifiable (e.g. two plain strings),
// which fails at first encode — surfacing as a silent onFailure skeleton in the UI.
import { DateTime, Effect, Option, Schema } from "effect";
import * as SchemaBinary from "effect/encoding/SchemaBinary";
import { describe, expect, it } from "@effect/vitest";
import { AddArcadeRunSummary } from "@/features/telemetry/domain/models";
import { BestRunTrophyCardData } from "@/features/charts/domain/models";

// `make` bypasses validation, so the fixtures are built lazily rather than at
// module scope: a renamed schema field then fails one test instead of crashing
// the whole file during import
const trophyValue = () =>
  BestRunTrophyCardData.make({
    deathReason: "Guesses",
    failedOnWord: "CRANE",
    finalScore: 120,
    finalStreak: 3,
    durationSeconds: 45,
    createdAt: DateTime.makeUnsafe("2025-09-01T12:00:00Z"),
  });

const sentinelValue = () => {
  // Built from one base allocation rather than calling `trophyValue()` once per
  // field: `make` bypasses validation, so the extra copies were pure garbage
  const base = trophyValue();
  return BestRunTrophyCardData.make({
    deathReason: "Forfeit",
    failedOnWord: "N/A",
    finalScore: base.finalScore,
    finalStreak: base.finalStreak,
    durationSeconds: base.durationSeconds,
    createdAt: base.createdAt,
  });
};

// Encodes to the binary wire form and decodes it back. Both halves are
// Effect-returning, so a shape mismatch surfaces as a SchemaError inside the
// test's failure channel instead of a raw throw that vitest reports as an
// unhandled exception. `decodeEffect`/`encodeEffect` rebuild a parser per call,
// which is immaterial at test scope
const roundTrip = <A>(codec: Schema.Codec<A, Uint8Array<ArrayBuffer>, never, never>, value: A) =>
  Schema.encodeEffect(codec)(value).pipe(Effect.flatMap((encoded) => Schema.decodeEffect(codec)(encoded)));

// The `Option` wrapper `getBestRunTrophyCard` declares as its RPC success type.
// Both arms matter: `findOneOption` yields `None` for an empty leaderboard, and
// that is the arm most likely to hit a SchemaBinary union-encoding bug
const trophyOption = Schema.Option(BestRunTrophyCardData);

describe("trophy card RPC wire schemas", () => {
  it.effect("SchemaBinary round-trips a BestRunTrophyCardData run", () =>
    Effect.gen(function* () {
      const value = trophyValue();
      expect(yield* roundTrip(SchemaBinary.toCodec(BestRunTrophyCardData), value)).toEqual(value);
    })
  );

  it.effect('SchemaBinary round-trips the forfeit sentinel row (failedOnWord = "N/A")', () =>
    Effect.gen(function* () {
      const value = sentinelValue();
      expect(yield* roundTrip(SchemaBinary.toCodec(BestRunTrophyCardData), value)).toEqual(value);
    })
  );

  it.effect("SchemaBinary round-trips the empty Option the RPC returns for an empty leaderboard", () =>
    Effect.gen(function* () {
      expect(yield* roundTrip(SchemaBinary.toCodec(trophyOption), Option.none())).toEqual(Option.none());
    })
  );

  it.effect("SchemaBinary round-trips the populated Option the RPC returns for a best run", () =>
    Effect.gen(function* () {
      const value = Option.some(trophyValue());
      expect(yield* roundTrip(SchemaBinary.toCodec(trophyOption), value)).toEqual(value);
    })
  );

  it.effect("SchemaBinary compiles the addArcadeRunSummary payload schema", () =>
    Effect.gen(function* () {
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
      expect(yield* roundTrip(SchemaBinary.toCodec(AddArcadeRunSummary), run)).toEqual(run);
    })
  );
});
