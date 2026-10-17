// Client-safe feature barrel: pure hack domain only. The AI-backed
// `./override2` module is deliberately NOT re-exported here — re-exporting
// the override generator through this barrel would make the whole AI stack
// (`@effect/ai-openrouter`, `effect/unstable/ai`) reachable from any client
// module importing hack constants/models. Server RPC handlers import it from
// "@/features/overdrive-hacks/domain/override2" directly (enforced by
// scripts/check-boundaries.mjs)
export * from "./constants";
export * from "./emp";
export * from "./models";
export * from "./sonar";
