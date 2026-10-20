// tanstack
import { createCsrfMiddleware, createStart } from "@tanstack/react-start";

// services, features, and other libraries
import { gtMiddleware } from "gt-tanstack-start";

// Scopes the request locale/region so server functions use the correct language.
// gtMiddleware resolves first, and CSRF protection guards every server function;
// plain server route POSTs (e.g. /api/rpc/*) are routed handlers, not serverFns,
// so they remain unaffected
const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

export const startInstance = createStart(() => ({
  requestMiddleware: [gtMiddleware, csrfMiddleware],
}));
