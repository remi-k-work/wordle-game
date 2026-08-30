// services, features, and other libraries
import { makeRpcClient } from "@/lib/rpc";
import { RpcTelemetry } from "./requests";

export class RpcTelemetryClient extends makeRpcClient("RpcTelemetryClient", RpcTelemetry, "/api/rpc/telemetry") {}
