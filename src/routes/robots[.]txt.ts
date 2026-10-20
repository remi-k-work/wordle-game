// tanstack
import { createFileRoute } from "@tanstack/react-router";

// robots.txt is fully static: the document constant lives here, and only the
// Response is minted per request, because a response body is single-use
const ROBOTS_TXT = "User-agent: *\nAllow: /\n";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: () => new Response(ROBOTS_TXT, { headers: { "content-type": "text/plain; charset=utf-8" } }),
    },
  },
});
