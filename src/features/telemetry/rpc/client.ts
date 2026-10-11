// services, features, and other libraries
import { makeRpcClient } from "@/domain";
import { RpcTelemetry } from "./requests";

export class RpcTelemetryClient extends makeRpcClient("RpcTelemetryClient", RpcTelemetry, "/api/rpc/telemetry") {}
