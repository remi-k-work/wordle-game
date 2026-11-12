// services, features, and other libraries
import { makeRpcClient } from "@/domain/helpers";
import { RpcTelemetry } from "./requests";

// constants
import { RPC_TELEMETRY_PATH } from "@/domain/constants";

export class RpcTelemetryClient extends makeRpcClient("RpcTelemetryClient", RpcTelemetry, RPC_TELEMETRY_PATH) {}
