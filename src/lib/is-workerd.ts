// Detects Cloudflare Workers runtime; browser and Node both lack this navigator value
// Shared between pg-config.ts and helpers.server.ts to keep the detection in one place
export const isWorkerd = typeof navigator !== "undefined" && navigator.userAgent === "Cloudflare-Workers";
