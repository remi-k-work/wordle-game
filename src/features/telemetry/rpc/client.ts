// services, features, and other libraries
import { makeRpcClient } from "@/domain/rpc-client";
import { RpcTelemetry } from "./requests";

// constants
import { RPC_TELEMETRY_PATH } from "./requests";

export class RpcTelemetryClient extends makeRpcClient("RpcTelemetryClient", RpcTelemetry, RPC_TELEMETRY_PATH) {}
