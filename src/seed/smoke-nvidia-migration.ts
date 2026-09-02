import "dotenv/config";

// services, features, and other libraries
import { Effect, Layer, Logger, Option } from "effect";
import { NodeHttpClient, NodeRuntime, NodeServices } from "@effect/platform-node";
import { makeNvidiaClientLayer } from "@/domain";
import { generateRiddle } from "@/features/game/domain/riddle2";
import { generateOverride } from "@/features/overdrive-hacks/domain/override2";

const NvidiaClientWithHttp = makeNvidiaClientLayer().pipe(Layer.provide(NodeHttpClient.layerUndici));
const MainLayer = Layer.mergeAll(Logger.layer([Logger.consolePretty()]), NodeServices.layer, NvidiaClientWithHttp);

const main = Effect.gen(function* () {
  yield* Effect.log("🔬 Smoke: NVIDIA migration (riddle2 + override2) — En/Pl");
  yield* Effect.log("============================================================");

  // Riddle En
  yield* Effect.log("\n--- riddle2 En (MIRROR) ---");
  const riddleEn = yield* generateRiddle("MIRROR", "En");
  const hasMirrorEn = riddleEn.toLowerCase().includes("mirror");
  yield* Effect.log(`RIDDLE En: "${riddleEn}"`);
  yield* Effect.log(`Contains "mirror": ${hasMirrorEn ? "❌ FAIL" : "✅ PASS"}`);

  yield* Effect.sleep("1 second");

  // Riddle Pl
  yield* Effect.log("\n--- riddle2 Pl (LUSTRO) ---");
  const riddlePl = yield* generateRiddle("LUSTRO", "Pl");
  const hasLustroPl = riddlePl.toLowerCase().includes("lustro");
  yield* Effect.log(`RIDDLE Pl: "${riddlePl}"`);
  yield* Effect.log(`Contains "lustro": ${hasLustroPl ? "❌ FAIL" : "✅ PASS"}`);

  yield* Effect.sleep("1 second");

  // Override En (no guesses)
  yield* Effect.log("\n--- override2 En (MIRROR, no guesses) ---");
  const overrideEn = yield* generateOverride("MIRROR", Option.some("a reflective surface"), Option.none(), [], "En");
  const overrideEnText = Option.getOrElse(overrideEn, () => "");
  const hasMirrorOverrideEn = overrideEnText.toLowerCase().includes("mirror");
  yield* Effect.log(`OVERRIDE En: "${overrideEnText}"`);
  yield* Effect.log(`Contains "mirror": ${hasMirrorOverrideEn ? "❌ FAIL" : "✅ PASS"}`);

  yield* Effect.sleep("1 second");

  // Override Pl
  yield* Effect.log("\n--- override2 Pl (LUSTRO, no guesses) ---");
  const overridePl = yield* generateOverride("LUSTRO", Option.some("powierzchnia odbijająca światło"), Option.none(), [], "Pl");
  const overridePlText = Option.getOrElse(overridePl, () => "");
  const hasLustroOverridePl = overridePlText.toLowerCase().includes("lustro");
  yield* Effect.log(`OVERRIDE Pl: "${overridePlText}"`);
  yield* Effect.log(`Contains "lustro": ${hasLustroOverridePl ? "❌ FAIL" : "✅ PASS"}`);

  // Summary
  const allPass = !hasMirrorEn && !hasLustroPl && !hasMirrorOverrideEn && !hasLustroOverridePl;
  yield* Effect.log("\n============================================================");
  if (allPass) {
    yield* Effect.log("✅ Smoke PASS — all 4 calls succeeded without leaking the secret word.");
  } else {
    yield* Effect.logError("❌ Smoke FAIL — forbidden word leaked.");
  }
}).pipe(Effect.provide(MainLayer));

// Use NodeRuntime.runMain for graceful teardown on CTRL+C
NodeRuntime.runMain(main);
