// Client-safe feature barrel: pure game domain only. The AI-backed
// `./riddle2` module is deliberately NOT re-exported here — client hooks
// (e.g. use-speak-text) import `matchLanguage` through this barrel, and
// re-exporting the riddle generator would pull the whole AI stack
// (`@effect/ai-openrouter`, `effect/unstable/ai`) into the browser bundle.
// Server RPC handlers import it from "@/features/game/domain/riddle2"
// directly (enforced by scripts/check-boundaries.mjs)
export * from "./constants";
export * from "./formatters";
export * from "./game-logic";
export * from "./helpers";
export * from "./models";
export * from "./validators";
