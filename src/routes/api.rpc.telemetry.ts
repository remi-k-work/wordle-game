// tanstack
import { createFileRoute } from "@tanstack/react-router";

// services, features, and other libraries
import { routeHandler } from "@/domain/helpers.server";
import { handler } from "@/features/telemetry/rpc/handlers.server";

// The path is a literal by framework requirement: TanStack's router plugin
// statically crawls route files and rejects a variable route id
export const Route = createFileRoute("/api/rpc/telemetry")({ server: { handlers: { POST: routeHandler(handler) } } });
