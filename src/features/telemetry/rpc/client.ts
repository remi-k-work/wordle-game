// services, features, and other libraries
import { makeRpcClient } from "@/domain/rpc-client";
import { RpcTelemetry } from "./requests";

export class RpcTelemetryClient extends makeRpcClient("RpcTelemetryClient", RpcTelemetry, "/api/rpc/telemetry") {}
