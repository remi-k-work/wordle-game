// services, features, and other libraries
import { handler } from "@/rpc/highScore/handlers";

// types
import type { NextRequest } from "next/server";

export const POST = (request: NextRequest): Promise<Response> => handler(request);
