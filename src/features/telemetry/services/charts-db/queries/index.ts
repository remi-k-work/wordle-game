// Every `Result` schema (in ../models.ts) uses camelCase field names, but every
// SQL SELECT here emits snake_case aliases. The bridge is `transformResultNames:
// Str.snakeToCamel` configured in src/lib/pg-live.ts (see F1). A future refactor
// that disables that transform (or sets only `transformQueryNames`) silently
// breaks every chart query at decode time (SchemaError → Effect.die → RPC 500).
export * from "./any-avg-stat";
export * from "./any-counter";
export * from "./arcade-streak-distribution";
export * from "./best-run-trophy-card";
export * from "./failed-words-frequency";
export * from "./guess-distribution";
export * from "./hardest-words-leaderboard";
export * from "./opening-guesses-frequency";
export * from "./run-death-reason-frequency";
export * from "./time-to-solve-distribution";
