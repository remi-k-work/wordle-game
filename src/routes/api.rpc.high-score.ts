// tanstack
import { createFileRoute } from "@tanstack/react-router";

// services, features, and other libraries
import { routeHandler } from "@/domain/helpers.server";
import { handler } from "@/features/high-score/rpc/handlers.server";

export const Route = createFileRoute("/api/rpc/high-score")({ server: { handlers: { POST: routeHandler(handler) } } });
