// tanstack
import { createFileRoute } from "@tanstack/react-router";

// services, features, and other libraries
import { routeHandler } from "@/domain/helpers.server";
import { handler } from "@/features/telemetry/rpc/handlers.server";

export const Route = createFileRoute("/api/rpc/telemetry")({ server: { handlers: { POST: routeHandler(handler) } } });
