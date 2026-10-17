// Client-safe domain barrel: constants, errors, formatters, machine-atom, and
// models only. The AI generation stack (fallback-plan*, generate-single-field*)
// is deliberately NOT re-exported here — any `"use client"` module importing
// this barrel would otherwise pull `@ai-sdk/google`, `@effect/ai-openrouter`,
// `ai`, and `zod` into the browser bundle. Server code imports those directly
// from their source modules (enforced by scripts/check-boundaries.mjs)
export * from "./constants";
export * from "./errors";
export * from "./formatters";
export * from "./machine-atom";
export * from "./models";
