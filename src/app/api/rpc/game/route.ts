// services, features, and other libraries
import { handler } from "@/features/game/rpc/handlers";

// types
import type { NextRequest } from "next/server";

// Allow streaming responses up to 60 seconds
export const maxDuration = 60;

export const POST = (request: NextRequest): Promise<Response> => handler.handler(request);
